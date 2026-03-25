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
  "workType": "Type of work",
  "conversationSummary": "AI summary",
  "approveMessage": "Pre-crafted approval",
  "declineMessage": "Pre-crafted decline",
  "rating": 4,
  "ratingReason": "Good fit - in our service area with matching work type"
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

need to do:
How Auto-Delete Works
The auto-delete feature:
- Triggers: When the dashboard loads, it checks if autoDeleteDeclinedDays > 0 in settings
- Behavior: Deletes all leads with status "declined" that are older than X days
- Requirements: 
  - Need a real Supabase connection (not mock data)
  - The API endpoint /api/cron/auto-delete needs to be called
For production, you should set up a cron job to call this endpoint daily:
# Example cron job (run daily at midnight)
curl -X POST https://your-domain.com/api/cron/auto-delete

create .env file
into it put:
`NEXT_PUBLIC_SUPABASE_URL`
`NEXT_PUBLIC_SUPABASE_ANON_KEY`
