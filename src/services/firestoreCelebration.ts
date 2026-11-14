import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  BgSceneId,
  CelebrationActivity,
  CelebrationRoom,
  CharacterAccessory,
  CharacterActionState,
  CharacterData,
  CrackerType,
  DressStyle,
  RoomChatMessage,
  RoomInvite,
  SweetType,
  UserProfile,
  WeatherMode
} from '../types';

export interface FirestoreEventDoc {
  eventId: string;
  roomId: string;
  type: 'join' | 'leave' | 'cracker' | 'sweet' | 'wish' | 'diya' | 'interact' | 'joy';
  uid: string;
  senderName: string;
  senderPhotoURL?: string;
  detail: string;
  crackerType?: CrackerType;
  sweetType?: SweetType;
  targetUid?: string;
  xPercent?: number;
  yPercent?: number;
  createdAt?: Timestamp | null;
}

const PARTICIPANT_STALE_MS = 12 * 60 * 1000; // 12 minutes heartbeat window

function generateInviteCode(uid: string): string {
  const prefix = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'DIWALI';
  const rand = Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

function generateEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}`;
}

export async function ensurePersonalRoomAndInvite(
  userProfile: UserProfile
): Promise<{ room: CelebrationRoom; invite: RoomInvite }> {
  const roomId = `room_${userProfile.uid.replace(/[^a-zA-Z0-9_\-]/g, '')}`;
  const roomRef = doc(db, 'celebrations', roomId);

  let room: CelebrationRoom;
  try {
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      const data = snap.data();
      room = {
        roomId: data.roomId || roomId,
        title: data.title || `${userProfile.displayName}'s Diwali Celebration`,
        hostUid: data.hostUid,
        hostName: data.hostName || userProfile.displayName,
        inviteCode: data.inviteCode,
        bgScene: data.bgScene || 'courtyard',
        weatherMode: data.weatherMode || 'starlit',
        crackersIgnited: Number(data.crackersIgnited || 0),
        sweetsShared: Number(data.sweetsShared || 0),
        wishesSent: Number(data.wishesSent || 0),
        diyasLit: Number(data.diyasLit || 0)
      };
    } else {
      const inviteCode = generateInviteCode(userProfile.uid);
      const title = `${userProfile.displayName.slice(0, 40)}'s Diwali Celebration`;
      const newRoomPayload = {
        roomId,
        title,
        hostUid: userProfile.uid,
        hostName: userProfile.displayName.slice(0, 60),
        inviteCode,
        bgScene: 'courtyard' as BgSceneId,
        weatherMode: 'starlit' as WeatherMode,
        crackersIgnited: 0,
        sweetsShared: 0,
        wishesSent: 0,
        diyasLit: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(roomRef, newRoomPayload);
      room = {
        roomId,
        title,
        hostUid: userProfile.uid,
        hostName: userProfile.displayName.slice(0, 60),
        inviteCode,
        bgScene: 'courtyard',
        weatherMode: 'starlit',
        crackersIgnited: 0,
        sweetsShared: 0,
        wishesSent: 0,
        diyasLit: 0
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `celebrations/${roomId}`);
  }

  // Ensure invite doc exists & is active
  const inviteRef = doc(db, 'invites', room.inviteCode);
  try {
    const invSnap = await getDoc(inviteRef);
    const sevenDaysLaterMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
    if (!invSnap.exists() || invSnap.data().status !== 'active') {
      const inviteCode = invSnap.exists() ? generateInviteCode(userProfile.uid) : room.inviteCode;
      const targetInviteRef = doc(db, 'invites', inviteCode);
      await setDoc(targetInviteRef, {
        inviteCode,
        roomId: room.roomId,
        roomTitle: room.title.slice(0, 80),
        hostUid: room.hostUid,
        hostName: room.hostName.slice(0, 60),
        status: 'active',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(sevenDaysLaterMs)
      });
      if (inviteCode !== room.inviteCode) {
        await updateDoc(roomRef, {
          inviteCode,
          updatedAt: serverTimestamp()
        });
        room = { ...room, inviteCode };
      }
      return {
        room,
        invite: {
          inviteCode,
          roomId: room.roomId,
          roomTitle: room.title,
          hostUid: room.hostUid,
          hostName: room.hostName,
          status: 'active',
          expiresAtMs: sevenDaysLaterMs
        }
      };
    } else {
      const invData = invSnap.data();
      const expiresAtMs = invData.expiresAt?.toMillis?.() || sevenDaysLaterMs;
      return {
        room,
        invite: {
          inviteCode: invData.inviteCode,
          roomId: invData.roomId,
          roomTitle: invData.roomTitle,
          hostUid: invData.hostUid,
          hostName: invData.hostName,
          status: invData.status,
          expiresAtMs
        }
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `invites/${room.inviteCode}`);
  }
}

export async function validateInviteCode(
  inviteCode: string
): Promise<{ valid: true; invite: RoomInvite; room: CelebrationRoom } | { valid: false; reason: string }> {
  const cleanCode = inviteCode.trim();
  if (!cleanCode || !/^[a-zA-Z0-9_\-]+$/.test(cleanCode)) {
    return { valid: false, reason: 'This invitation code format is invalid.' };
  }

  try {
    const invSnap = await getDoc(doc(db, 'invites', cleanCode));
    if (!invSnap.exists()) {
      return { valid: false, reason: 'This invitation link could not be found or has been removed.' };
    }
    const invData = invSnap.data();
    if (invData.status !== 'active') {
      return { valid: false, reason: 'This celebration invitation was revoked by the host.' };
    }
    const expiresAtMs = invData.expiresAt?.toMillis?.() ?? 0;
    if (expiresAtMs && expiresAtMs < Date.now()) {
      return { valid: false, reason: 'This invitation link has expired.' };
    }

    const roomSnap = await getDoc(doc(db, 'celebrations', invData.roomId));
    if (!roomSnap.exists()) {
      return { valid: false, reason: 'The celebration room for this invitation no longer exists.' };
    }
    const roomData = roomSnap.data();

    return {
      valid: true,
      invite: {
        inviteCode: invData.inviteCode,
        roomId: invData.roomId,
        roomTitle: invData.roomTitle,
        hostUid: invData.hostUid,
        hostName: invData.hostName,
        status: invData.status,
        expiresAtMs
      },
      room: {
        roomId: roomData.roomId,
        title: roomData.title,
        hostUid: roomData.hostUid,
        hostName: roomData.hostName,
        inviteCode: roomData.inviteCode,
        bgScene: roomData.bgScene || 'courtyard',
        weatherMode: roomData.weatherMode || 'starlit',
        crackersIgnited: Number(roomData.crackersIgnited || 0),
        sweetsShared: Number(roomData.sweetsShared || 0),
        wishesSent: Number(roomData.wishesSent || 0),
        diyasLit: Number(roomData.diyasLit || 0)
      }
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `invites/${cleanCode}`);
  }
}

export async function joinRoomAsParticipant(
  roomId: string,
  profile: UserProfile,
  relation: string,
  announceJoin = true
): Promise<void> {
  const partRef = doc(db, 'celebrations', roomId, 'participants', profile.uid);
  const path = `celebrations/${roomId}/participants/${profile.uid}`;

  const xPercent = Math.round(18 + Math.random() * 64);
  const yPercent = Math.round(70 + Math.random() * 11);

  try {
    const existingSnap = await getDoc(partRef);
    const wasOnline = existingSnap.exists() && existingSnap.data()?.online === true;

    if (!existingSnap.exists()) {
      await setDoc(partRef, {
        uid: profile.uid,
        roomId,
        name: profile.displayName.slice(0, 60),
        relation: relation.slice(0, 60) || 'Celebrator',
        photoURL: profile.photoURL.slice(0, 195000),
        gender: profile.gender,
        dressStyle: profile.dressStyle,
        outfitColor: profile.outfitColor,
        accentBg: profile.accentBg,
        accessory: profile.accessory || 'none',
        xPercent,
        yPercent,
        direction: Math.random() > 0.5 ? 'right' : 'left',
        state: 'celebrating',
        online: true,
        joinedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp()
      });
    } else {
      await updateDoc(partRef, {
        name: profile.displayName.slice(0, 60),
        relation: relation.slice(0, 60) || 'Celebrator',
        photoURL: profile.photoURL.slice(0, 195000),
        gender: profile.gender,
        dressStyle: profile.dressStyle,
        outfitColor: profile.outfitColor,
        accentBg: profile.accentBg,
        accessory: profile.accessory || 'none',
        online: true,
        state: 'celebrating',
        lastSeenAt: serverTimestamp()
      });
    }

    if (announceJoin && !wasOnline) {
      const eventId = generateEventId('join');
      const eventRef = doc(db, 'celebrations', roomId, 'events', eventId);
      await setDoc(eventRef, {
        eventId,
        roomId,
        type: 'join',
        uid: profile.uid,
        senderName: profile.displayName.slice(0, 60),
        senderPhotoURL: profile.photoURL.slice(0, 195000),
        detail: `${profile.displayName.slice(0, 40)} joined the celebration!`,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateOwnParticipant(
  roomId: string,
  uid: string,
  patch: Partial<{
    name: string;
    relation: string;
    photoURL: string;
    gender: 'female' | 'male';
    dressStyle: DressStyle;
    outfitColor: string;
    accentBg: string;
    accessory: CharacterAccessory;
    xPercent: number;
    yPercent: number;
    direction: 'left' | 'right';
    state: CharacterActionState;
    online: boolean;
  }>
): Promise<void> {
  const partRef = doc(db, 'celebrations', roomId, 'participants', uid);
  const path = `celebrations/${roomId}/participants/${uid}`;
  try {
    const cleanPatch: Record<string, unknown> = {
      lastSeenAt: serverTimestamp()
    };
    if (patch.name !== undefined) cleanPatch.name = patch.name.slice(0, 60);
    if (patch.relation !== undefined) cleanPatch.relation = patch.relation.slice(0, 60);
    if (patch.photoURL !== undefined) cleanPatch.photoURL = patch.photoURL.slice(0, 195000);
    if (patch.gender !== undefined) cleanPatch.gender = patch.gender;
    if (patch.dressStyle !== undefined) cleanPatch.dressStyle = patch.dressStyle;
    if (patch.outfitColor !== undefined) cleanPatch.outfitColor = patch.outfitColor;
    if (patch.accentBg !== undefined) cleanPatch.accentBg = patch.accentBg;
    if (patch.accessory !== undefined) cleanPatch.accessory = patch.accessory;
    if (patch.xPercent !== undefined) cleanPatch.xPercent = Math.max(8, Math.min(92, patch.xPercent));
    if (patch.yPercent !== undefined) cleanPatch.yPercent = Math.max(50, Math.min(90, patch.yPercent));
    if (patch.direction !== undefined) cleanPatch.direction = patch.direction;
    if (patch.state !== undefined) cleanPatch.state = patch.state;
    if (patch.online !== undefined) cleanPatch.online = patch.online;

    await updateDoc(partRef, cleanPatch);
  } catch (err) {
    // Heartbeats can race on logout/delete — surface only genuine permission issues
    if ((err as { code?: string })?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
}

export async function leaveRoomPresence(
  roomId: string,
  uid: string,
  senderName: string,
  announceLeave = true
): Promise<void> {
  const partRef = doc(db, 'celebrations', roomId, 'participants', uid);
  try {
    const snap = await getDoc(partRef);
    if (snap.exists() && snap.data()?.online === true) {
      await updateDoc(partRef, {
        online: false,
        lastSeenAt: serverTimestamp()
      });

      if (announceLeave) {
        const eventId = generateEventId('leave');
        await setDoc(doc(db, 'celebrations', roomId, 'events', eventId), {
          eventId,
          roomId,
          type: 'leave',
          uid,
          senderName: senderName.slice(0, 60),
          detail: `${senderName.slice(0, 40)} left the celebration`,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch {
    // Graceful best-effort cleanup during unload/logout
  }
}

export async function broadcastCrackerAction(
  roomId: string,
  userProfile: UserProfile,
  crackerType: CrackerType,
  crackerLabel: string,
  xPercent: number,
  yPercent: number
): Promise<void> {
  const eventId = generateEventId('cracker');
  const clampedX = Math.max(2, Math.min(98, Number(xPercent.toFixed(2))));
  const clampedY = Math.max(10, Math.min(95, Number(yPercent.toFixed(2))));

  const batch = writeBatch(db);
  batch.set(doc(db, 'celebrations', roomId, 'events', eventId), {
    eventId,
    roomId,
    type: 'cracker',
    uid: userProfile.uid,
    senderName: userProfile.displayName.slice(0, 60),
    senderPhotoURL: userProfile.photoURL.slice(0, 195000),
    detail: `${userProfile.displayName.slice(0, 32)} lit ${crackerLabel}!`,
    crackerType,
    xPercent: clampedX,
    yPercent: clampedY,
    createdAt: serverTimestamp()
  });

  batch.update(doc(db, 'celebrations', roomId), {
    crackersIgnited: increment(1),
    updatedAt: serverTimestamp()
  });

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `celebrations/${roomId}/events/${eventId}`);
  }
}

export async function broadcastSweetAction(
  roomId: string,
  userProfile: UserProfile,
  sweetType: SweetType,
  sweetName: string,
  targetUid?: string,
  targetName?: string
): Promise<void> {
  const eventId = generateEventId('sweet');
  const detail = targetName
    ? `${userProfile.displayName.slice(0, 28)} shared ${sweetName} with ${targetName.slice(0, 28)}!`
    : `${userProfile.displayName.slice(0, 32)} shared ${sweetName} with everyone!`;

  const batch = writeBatch(db);
  const payload: Record<string, unknown> = {
    eventId,
    roomId,
    type: 'sweet',
    uid: userProfile.uid,
    senderName: userProfile.displayName.slice(0, 60),
    senderPhotoURL: userProfile.photoURL.slice(0, 195000),
    detail: detail.slice(0, 240),
    sweetType,
    createdAt: serverTimestamp()
  };
  if (targetUid) payload.targetUid = targetUid;

  batch.set(doc(db, 'celebrations', roomId, 'events', eventId), payload);
  batch.update(doc(db, 'celebrations', roomId), {
    sweetsShared: increment(1),
    updatedAt: serverTimestamp()
  });

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `celebrations/${roomId}/events/${eventId}`);
  }
}

export async function broadcastWishOrDiyaOrInteract(
  roomId: string,
  userProfile: UserProfile,
  type: 'wish' | 'diya' | 'interact',
  detail: string,
  targetUid?: string
): Promise<void> {
  const eventId = generateEventId(type);
  const batch = writeBatch(db);

  const payload: Record<string, unknown> = {
    eventId,
    roomId,
    type,
    uid: userProfile.uid,
    senderName: userProfile.displayName.slice(0, 60),
    senderPhotoURL: userProfile.photoURL.slice(0, 195000),
    detail: detail.slice(0, 240),
    createdAt: serverTimestamp()
  };
  if (targetUid) payload.targetUid = targetUid;

  batch.set(doc(db, 'celebrations', roomId, 'events', eventId), payload);

  const roomUpdates: Record<string, unknown> = {
    updatedAt: serverTimestamp()
  };
  if (type === 'diya') {
    roomUpdates.diyasLit = increment(1);
  } else {
    roomUpdates.wishesSent = increment(1);
  }
  batch.update(doc(db, 'celebrations', roomId), roomUpdates);

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `celebrations/${roomId}/events/${eventId}`);
  }
}

export async function broadcastJoyExplosion(
  roomId: string,
  userProfile: UserProfile,
  customDetail?: string
): Promise<void> {
  const eventId = generateEventId('joy');
  const detail = (
    customDetail?.trim() || `${userProfile.displayName.slice(0, 36)} shared Diwali Joy with everyone!`
  ).slice(0, 240);

  const batch = writeBatch(db);
  batch.set(doc(db, 'celebrations', roomId, 'events', eventId), {
    eventId,
    roomId,
    type: 'joy',
    uid: userProfile.uid,
    senderName: userProfile.displayName.slice(0, 60) || 'Celebrator',
    senderPhotoURL: userProfile.photoURL.slice(0, 195000),
    detail,
    createdAt: serverTimestamp()
  });

  batch.update(doc(db, 'celebrations', roomId), {
    wishesSent: increment(1),
    updatedAt: serverTimestamp()
  });

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `celebrations/${roomId}/events/${eventId}`);
  }
}

export async function updateRoomSceneOrWeather(
  roomId: string,
  patch: Partial<{ bgScene: BgSceneId; weatherMode: WeatherMode; title: string }>
): Promise<void> {
  const path = `celebrations/${roomId}`;
  try {
    await updateDoc(doc(db, 'celebrations', roomId), {
      ...patch,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeToRoom(
  roomId: string,
  onRoom: (room: CelebrationRoom) => void
): () => void {
  const path = `celebrations/${roomId}`;
  return onSnapshot(
    doc(db, 'celebrations', roomId),
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      onRoom({
        roomId: data.roomId,
        title: data.title,
        hostUid: data.hostUid,
        hostName: data.hostName,
        inviteCode: data.inviteCode,
        bgScene: data.bgScene || 'courtyard',
        weatherMode: data.weatherMode || 'starlit',
        crackersIgnited: Number(data.crackersIgnited || 0),
        sweetsShared: Number(data.sweetsShared || 0),
        wishesSent: Number(data.wishesSent || 0),
        diyasLit: Number(data.diyasLit || 0)
      });
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToParticipants(
  roomId: string,
  currentUid: string,
  hostUid: string,
  onParticipants: (participants: CharacterData[]) => void
): () => void {
  const path = `celebrations/${roomId}/participants`;
  const q = query(collection(db, 'celebrations', roomId, 'participants'), where('roomId', '==', roomId));

  return onSnapshot(
    q,
    (snapshot) => {
      const nowMs = Date.now();
      const list: CharacterData[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const lastSeenMs = d.lastSeenAt?.toMillis?.() ?? nowMs;
        const isFresh = nowMs - lastSeenMs < PARTICIPANT_STALE_MS;
        if (d.online === true && (isFresh || d.uid === currentUid)) {
          list.push({
            id: d.uid,
            uid: d.uid,
            name: d.name,
            relation: d.uid === hostUid ? 'Host' : d.relation || 'Friend',
            outfitColor: d.outfitColor,
            accentBg: d.accentBg,
            avatarUrl: d.photoURL,
            xPercent: Number(d.xPercent ?? 50),
            yPercent: Number(d.yPercent ?? 74),
            direction: d.direction === 'left' ? 'left' : 'right',
            state: d.state || 'idle',
            happiness: 100,
            gender: d.gender === 'male' ? 'male' : 'female',
            dressStyle: d.dressStyle || 'kurta',
            accessory: (d.accessory as CharacterAccessory | undefined) || 'none',
            online: true,
            isCurrentUser: d.uid === currentUid,
            isHost: d.uid === hostUid
          });
        }
      });

      list.sort((a, b) => {
        if (a.isCurrentUser && !b.isCurrentUser) return -1;
        if (!a.isCurrentUser && b.isCurrentUser) return 1;
        if (a.isHost && !b.isHost) return -1;
        if (!a.isHost && b.isHost) return 1;
        return a.name.localeCompare(b.name);
      });

      onParticipants(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export function subscribeToRoomEvents(
  roomId: string,
  onEvents: (activities: CelebrationActivity[], newEvents: FirestoreEventDoc[]) => void
): () => void {
  const path = `celebrations/${roomId}/events`;
  const q = query(collection(db, 'celebrations', roomId, 'events'), where('roomId', '==', roomId));

  const seenIds = new Set<string>();
  let initialized = false;

  return onSnapshot(
    q,
    (snapshot) => {
      const allEvents: Array<FirestoreEventDoc & { tsMs: number }> = [];
      const freshRemote: FirestoreEventDoc[] = [];

      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as FirestoreEventDoc;
        const tsMs = d.createdAt?.toMillis?.() ?? Date.now();
        allEvents.push({ ...d, tsMs });

        if (!seenIds.has(d.eventId)) {
          seenIds.add(d.eventId);
          if (initialized) {
            freshRemote.push(d);
          }
        }
      });

      initialized = true;
      allEvents.sort((a, b) => b.tsMs - a.tsMs);

      const activities: CelebrationActivity[] = allEvents.slice(0, 35).map((ev) => ({
        id: ev.eventId,
        type: ev.type,
        text: ev.detail,
        sender: ev.senderName,
        senderPhotoURL: ev.senderPhotoURL,
        timestamp: ev.tsMs
      }));

      onEvents(activities, freshRemote);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function sendRoomMessage(
  roomId: string,
  userProfile: UserProfile,
  rawText: string,
  kind: 'chat' | 'greeting' = 'chat',
  recipient?: { uid: string; name: string } | null
): Promise<void> {
  const cleanText = rawText.trim().slice(0, 400);
  if (!cleanText) return;

  const messageId = generateEventId('msg');
  const path = `celebrations/${roomId}/messages/${messageId}`;
  const payload: Record<string, unknown> = {
    messageId,
    roomId,
    uid: userProfile.uid,
    senderName: userProfile.displayName.slice(0, 60) || 'Celebrator',
    text: cleanText,
    kind,
    createdAt: serverTimestamp()
  };

  if (userProfile.photoURL && userProfile.photoURL.length <= 195000) {
    payload.senderPhotoURL = userProfile.photoURL;
  }
  if (recipient && recipient.uid && recipient.name.trim()) {
    payload.recipientUid = recipient.uid;
    payload.recipientName = recipient.name.trim().slice(0, 60);
  }

  try {
    await setDoc(doc(db, 'celebrations', roomId, 'messages', messageId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteRoomMessage(roomId: string, messageId: string): Promise<void> {
  const path = `celebrations/${roomId}/messages/${messageId}`;
  try {
    await deleteDoc(doc(db, 'celebrations', roomId, 'messages', messageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToRoomMessages(
  roomId: string,
  onMessages: (messages: RoomChatMessage[], freshMessages: RoomChatMessage[]) => void
): () => void {
  const path = `celebrations/${roomId}/messages`;
  const q = query(collection(db, 'celebrations', roomId, 'messages'), where('roomId', '==', roomId));

  const seenIds = new Set<string>();
  let initialized = false;

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RoomChatMessage[] = [];
      const freshMessages: RoomChatMessage[] = [];

      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const createdAtMs = d.createdAt?.toMillis?.() ?? Date.now();
        const msg: RoomChatMessage = {
          messageId: d.messageId,
          roomId: d.roomId,
          uid: d.uid,
          senderName: d.senderName,
          senderPhotoURL: d.senderPhotoURL,
          text: d.text,
          kind: d.kind === 'greeting' ? 'greeting' : 'chat',
          recipientUid: d.recipientUid,
          recipientName: d.recipientName,
          createdAtMs
        };
        list.push(msg);

        if (!seenIds.has(msg.messageId)) {
          seenIds.add(msg.messageId);
          if (initialized) {
            freshMessages.push(msg);
          }
        }
      });

      initialized = true;
      list.sort((a, b) => a.createdAtMs - b.createdAtMs);
      freshMessages.sort((a, b) => a.createdAtMs - b.createdAtMs);

      onMessages(list.slice(-120), freshMessages);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

