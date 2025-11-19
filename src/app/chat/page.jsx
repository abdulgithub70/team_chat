import AppSidebar from "@/components/AppSidebar";
import ChatBox from "@/components/ChatBox";
export default function ChatPage() {

    return (
        <>
        <div>
            <AppSidebar>
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Chat Page</h1>
                    {/* Chat page content goes here */}
                </div>
                <ChatBox activeEmployee={activeEmployee} loggedInUserId={loggedInUserId} />
            </AppSidebar>
        </div>
        </>
    )
}