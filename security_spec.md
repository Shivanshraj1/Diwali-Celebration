# Firestore Security Specification — Diwali Celebration

## 1. Data Invariants
1. **Owner-Only Profile & Private PII**: `/users/{uid}` and `/users/{uid}/private/account` cannot be listed globally or read by other users (`allow list: if false;`, `allow get, create, update, delete: if isOwner(uid)`).
2. **Parent Existence & Host Ownership**: Participants (`/celebrations/{roomId}/participants/{uid}`), Events (`/celebrations/{roomId}/events/{eventId}`), and Invites (`/invites/{inviteCode}`) cannot exist without an existing parent room `/celebrations/{roomId}`. Invites can only be created/revoked by the verified room host (`hostUid == request.auth.uid`).
3. **Verified Identity**: Write operations require verified Firebase Authentication (`request.auth != null && request.auth.token.email_verified == true`). Document author fields (`uid`, `hostUid`) must equal `request.auth.uid`.
4. **Action-Based Updates & Immutable Fields**: Updates on `/celebrations/{roomId}` use strict `affectedKeys().hasOnly(...)` branches (Host Settings vs. Participant Counter Increment) and lock `roomId`, `hostUid`, `createdAt`, and `inviteCode` (for non-hosts).
5. **Immutable Event Stream**: `/celebrations/{roomId}/events/{eventId}` is append-only (`update` and `delete` denied), enforces `createdAt == request.time`, and matches path `roomId` & `eventId`.
6. **Room Chat Messages**: `/celebrations/{roomId}/messages/{messageId}` enforces `uid == request.auth.uid`, valid parent room existence, `createdAt == request.time`, `text.size() <= 400`, no updates, and deletion restricted strictly to message author or room host.
7. **Terminal Invite Revocation**: Once an invite `status` reaches `'revoked'`, it cannot revert to `'active'`.
8. **Wardrobe Schema Constraints**: Public profiles and room participants validate strictly allowed `dressStyle` values (`saree`, `lehenga`, `anarkali`, `suit`, `kurta`, `sherwani`, `indo_western`) and optional `accessory` values (`none`, `dupatta`, `pagdi`, `shawl`, `jhumka`, `mala`, `bindi`, `glasses`) with zero arbitrary shadow fields.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Room Read**: `get /celebrations/room_abc` with `auth == null`.
2. **User Directory Scraping**: `list /users` even when signed in.
3. **Cross-User PII Access**: Signed-in user `bob` tries `get /users/alice/private/account`.
4. **Shadow Field Injection on Profile**: `create /users/alice` with extra ghost field `{ ..., isAdmin: true }`.
5. **ID Path Poisoning**: `create /celebrations/../../evil` or 500-char room ID.
6. **Participant Impersonation**: Signed-in user `bob` writes `/celebrations/room_1/participants/alice` or sets `uid: "alice"`.
7. **Orphaned Event Creation**: `create /celebrations/nonexistent_room/events/ev1`.
8. **Backdated Event Timestamp**: `create /celebrations/room_1/events/ev1` with client `createdAt` instead of `request.time`.
9. **Event Tampering / Deletion**: `update` or `delete` on `/celebrations/room_1/events/ev1`.
10. **Non-Host Hijacking Room Title/Host**: Non-host `bob` tries `update /celebrations/room_1` changing `hostUid` or `title`.
11. **Counter Overflow / Negative Reset**: Signed-in participant sets `crackersIgnited: -5` or `+999999` in one update.
12. **Revoked Invite Re-Activation**: Host attempts to update `invites/CODE` from `status: 'revoked'` back to `'active'`, or non-host tries to create an invite for another host's room.
