import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to TeamChat 💬</h1>
        <div className="flex gap-4">
          <a href="/register" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Register</a>
          <a href="/login" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">Login</a>
        </div>
      </div>
    </>  );
}
