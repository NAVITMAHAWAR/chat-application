# Group Chat Kaise Kaam Karta Hai

Yeh document is project ke group chat feature ko samajhne ke liye hai. Isme bataya gaya hai ki group kaise create hota hai, message database me kaise save hota hai aur Socket.IO ke through members tak kaise pahunchta hai.

## 1. Group Chat Ka Basic Idea

Normal one-to-one chat me do users hote hain:

```text
User A <-> User B
```

Group chat me ek conversation ke andar teen ya usse zyada participants hote hain:

```text
User A
User B  <->  Group Conversation
User C
```

Is project me group ek alag `Conversations` document hai. Us document me:

- `name`: group ka naam
- `isGroup: true`: yeh batata hai ki conversation group hai
- `participants`: group ke users ki IDs
- `message`: is group ke messages ki IDs

## 2. Group Create Karne Ka Flow

### Step 1: User group button click karta hai

Frontend me [CreateGroup.jsx](frontend/src/left/CreateGroup.jsx) group name aur users ki list dikhata hai. User kam se kam do members select karta hai.

Frontend yeh data backend ko bhejta hai:

```json
{
  "name": "Friends Group",
  "memberIds": ["user-id-2", "user-id-3"]
}
```

### Step 2: Backend creator ko bhi participant banata hai

Request `POST /api/message/groups` par jaati hai. Backend logged-in user ki ID ko selected IDs ke saath combine karta hai.

```text
selected members: User B, User C
logged-in creator: User A
final participants: User A, User B, User C
```

Isliye frontend par do members select karne par total group size teen hoti hai.

### Step 3: Validation hoti hai

Backend check karta hai:

- group name empty na ho
- kam se kam do valid members select hue hon
- sabhi member IDs valid MongoDB ObjectId hon
- sabhi members database me exist karte hon

Validation [message.controller.js](backend/controllers/message.controller.js) ke `createGroup` function me hoti hai.

### Step 4: MongoDB me group save hota hai

Valid request ke baad ek conversation create hoti hai:

```json
{
  "name": "Friends Group",
  "isGroup": true,
  "participants": ["user-id-1", "user-id-2", "user-id-3"],
  "message": []
}
```

Iska schema [conversation.model.js](backend/model/conversation.model.js) me defined hai.

### Step 5: Group sabhi online members ko bataya jata hai

Backend online members ke Socket.IO connections dhoondta hai aur `groupCreated` event emit karta hai. Isse online members ko page refresh ki zaroorat nahi padti.

Frontend ka `useGetGroups` hook is event ko receive karke group list me add karta hai.

## 3. Group List Kaise Load Hoti Hai

Jab user login karta hai, [useGetGroups.js](frontend/src/context/useGetGroups.js) yeh request bhejta hai:

```http
GET /api/message/groups
```

Backend sirf wahi groups return karta hai jisme current logged-in user participant hai:

```js
{
  isGroup: true,
  participants: req.user._id
}
```

[Left.jsx](frontend/src/left/Left.jsx) groups ko sidebar me dikhata hai. Group select karne par:

1. selected conversation set hoti hai
2. purane messages clear hote hain
3. group messages load karne ke liye right chat panel request bhejta hai

## 4. Purane Group Messages Load Karna

Group select hone par frontend request bhejta hai:

```http
GET /api/message/groups/:groupId/messages
```

Backend verify karta hai ki:

- group ID valid hai
- conversation group hai
- current user us group ka participant hai

Uske baad messages ke saath sender ka naam aur email populate karke response bheja jata hai.

## 5. Group Message Send Karna

### Frontend

[useSendMessage.js](frontend/src/context/useSendMessage.js) selected conversation ke `isGroup` flag ko check karta hai.

Group ke liye endpoint hota hai:

```http
POST /api/message/groups/:groupId/send
```

Request body:

```json
{
  "message": "Hello everyone"
}
```

### Backend

`sendGroupMessage` function yeh steps karta hai:

1. message empty hai ya nahi, check karta hai
2. group exist karta hai aur user uska member hai, check karta hai
3. `Message` collection me naya message save karta hai
4. group conversation ke `message` array me message ID add karta hai
5. sender ki details populate karta hai
6. baaki group members ko Socket.IO event bhejta hai

Message ka example:

```json
{
  "senderId": "user-id-1",
  "conversationId": "group-id-1",
  "message": "Hello everyone"
}
```

Group message me `receiverId` ki zaroorat nahi hoti, kyunki receiver ek user nahi balki poora group hota hai. Group ki pehchan `conversationId` se hoti hai.

## 6. Real-Time Message Kaise Milta Hai

Login ke baad [SocketContext.jsx](frontend/src/context/SocketContext.jsx) Socket.IO connection banata hai aur `userId` query me bhejta hai.

Backend har socket ko user ID ke saath map karta hai:

```text
socket-id-1 -> user-id-1
socket-id-2 -> user-id-2
```

Message send hone ke baad backend group ke baaki online users ke sockets par `newMessage` event emit karta hai.

[usegetSocketMessage.js](frontend/src/context/usegetSocketMessage.js) event receive karta hai. Agar aane wala message current selected group ka hai, to frontend usse message list me add kar deta hai. Agar doosre group ka message hai, to notification sound baj sakti hai lekin message current chat me add nahi hota.

## 7. API Summary

| Kaam | Method | Endpoint |
|---|---|---|
| Group create karna | `POST` | `/api/message/groups` |
| User ke groups lana | `GET` | `/api/message/groups` |
| Group messages lana | `GET` | `/api/message/groups/:id/messages` |
| Group message bhejna | `POST` | `/api/message/groups/:id/send` |

In sabhi routes par `secureRoute` laga hua hai, isliye user ka login token required hai.

## 8. One-to-One Aur Group Chat Me Difference

| Feature | One-to-one | Group |
|---|---|---|
| Participants | Do users | Teen ya zyada users |
| Message endpoint | `/send/:userId` | `/groups/:groupId/send` |
| Receiver | Ek user | Group ke sabhi members |
| Message matching | `senderId` | `conversationId` |
| `receiverId` | Use hota hai | Required nahi |
| Conversation flag | Default `false` | `isGroup: true` |

## 9. Feature Ko Test Karne Ka Tarika

1. Kam se kam teen registered users database me rakhein.
2. User A se login karein.
3. `+` button click karke group name likhein.
4. User B aur User C select karein.
5. `Create group` click karein.
6. Check karein ki group sidebar me dikh raha hai.
7. User B aur User C ke browser/session me check karein ki group real time me add hua.
8. Group me message bhejein.
9. Baaki online members ke sessions me message receive hona check karein.
10. Page refresh karke check karein ki group aur messages database se dobara load ho rahe hain.

## 10. Important Rules

- Creator automatically group ka member ban jata hai.
- Frontend me minimum do users select karne hote hain.
- Backend membership dobara verify karta hai; sirf frontend par trust nahi karta.
- Offline user ko Socket.IO event turant nahi milega, lekin message database me save rahega.
- Offline user group open ya refresh karne par saved message dekh sakta hai.
- Group message sirf usi group ke participants bhej sakte hain.

## Short Summary

```text
Create group
  -> validate users
  -> save Conversations document
  -> emit groupCreated
  -> show group in sidebar

Send group message
  -> verify group membership
  -> save Message document
  -> add message ID to conversation
  -> emit newMessage to online members
  -> update open chat screen
```
