<?php
namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // GET /api/employer/messages — list of conversations
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->get()
            ->groupBy(fn($m) => $m->sender_id === $userId ? $m->receiver_id : $m->sender_id)
            ->map(fn($messages, $otherId) => [
                'user'    => User::find($otherId)?->only(['id','name']),
                'last'    => $messages->sortByDesc('created_at')->first(),
                'unread'  => $messages->where('receiver_id', $userId)->where('is_read', false)->count(),
            ])
            ->values();

        return response()->json($conversations);
    }

    // GET /api/employer/messages/{userId} — thread with one user
    public function thread(Request $request, $userId)
    {
        $myId = $request->user()->id;

        $messages = Message::where(fn($q) =>
            $q->where('sender_id', $myId)->where('receiver_id', $userId)
        )->orWhere(fn($q) =>
            $q->where('sender_id', $userId)->where('receiver_id', $myId)
        )->orderBy('created_at')->get();

        // Mark as read
        Message::where('sender_id', $userId)->where('receiver_id', $myId)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    // POST /api/employer/messages — send a message
    public function send(Request $request)
    {
        $data = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body'        => 'required|string',
        ]);

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $data['receiver_id'],
            'body'        => $data['body'],
        ]);

        return response()->json($message, 201);
    }

    // NEW — POST /api/employer/messages/start
    public function start(Request $request)
    {
        $workerId = $request->input('worker_id');
        $employerId = $request->user()->id;

        if (!$workerId || !User::find($workerId)) {
            return response()->json(['message' => 'Invalid worker ID'], 422);
        }

        // Check if there is already a conversation
        $existing = Message::where(function($q) use ($employerId, $workerId) {
            $q->where('sender_id', $employerId)->where('receiver_id', $workerId);
        })->orWhere(function($q) use ($employerId, $workerId) {
            $q->where('sender_id', $workerId)->where('receiver_id', $employerId);
        })->first();

        // Return existing conversation or a placeholder
        return response()->json([
            'conversation_exists' => (bool)$existing,
            'worker_id' => $workerId,
            'employer_id' => $employerId
        ]);
    }
}