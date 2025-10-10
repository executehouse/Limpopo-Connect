# Schema Map (Local)

Generated: 2025-10-10

Core tables and relations:
- auth.users (Supabase managed)
- public.profiles [id PK -> auth.users.id]
- public.rooms [id PK]
- public.room_members [room_id -> rooms.id, user_id -> auth.users.id, PK(room_id,user_id)]
- public.message_threads [id PK, room_id -> rooms.id, created_by -> auth.users.id]
- public.room_messages [id PK, thread_id -> message_threads.id, room_id -> rooms.id, user_id -> auth.users.id]
- public.room_messages_audit [id serial PK, message_id -> room_messages.id]
- public.summary_jobs [id serial PK, thread_id -> message_threads.id]
- public.thread_summaries [id uuid PK, thread_id UNIQUE -> message_threads.id]
- public.businesses [id uuid PK, created_by -> auth.users.id]
- public.reports [id uuid PK, reporter_id -> auth.users.id]

Indexes:
- room_members(room_id,user_id), room_members(user_id)
- message_threads(room_id), message_threads(room_id,last_activity_at)
- room_messages(thread_id,created_at), room_messages(room_id,created_at), room_messages(user_id)
- room_messages_audit(message_id)
- summary_jobs(status,next_run_at)

RLS: Enabled on all public tables above. See migration for detailed policies.

Realtime topics:
- room:{room_id}:messages — triggered on insert/update/delete of room_messages via tg_broadcast_room_message.
