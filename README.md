# Leed_Optimizer

api:
## JSON Request Structure (from your backend to this platform)

**POST to `/api/leads`:**

```json
{
  "name": "Customer Name",
  "phone": "+1234567890",
  "email": "customer@email.com",
  "location": "City, State",
  "workType": "Type of work needed",
  "conversationSummary": "AI summary of the conversation",
  "approveMessage": "Pre-crafted approval response",
  "declineMessage": "Pre-crafted decline response"
}
```

## Response Structure (sent to your chatbot when user clicks Send)

**Sent to `CHATBOT_WEBHOOK_URL` environment variable:**

```json
{
  "leadId": "lead-123456789",
  "action": "approve" | "decline",
  "message": "The edited message content",
  "phone": "+1234567890"
}
```


Set the `CHATBOT_WEBHOOK_URL` environment variable to configure where responses are sent.


to run:
- pnpm install
- pnpm dev
