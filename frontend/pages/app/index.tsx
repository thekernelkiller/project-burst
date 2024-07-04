import React, { useState, useRef, useContext, useEffect } from "react";
import ChatBody from "@/components/chat_body";
import { WebsocketContext } from "../../modules/websocket_provider";
import { usePathname, useRouter } from "next/navigation";
import { API_URL } from "@/constants";
import autosize from "autosize";
import { AuthContext } from "@/modules/auth_provider";
import { IoMdCloseCircleOutline, IoMdSettings } from "react-icons/io";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import Link from "next/link";
export type Message = {
  content: string;
  client_id: string;
  username: string;
  room_id: string;
  type: "recv" | "self";
};

const index = () => {
  const [messages, setMessage] = useState<Array<Message>>([]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const { conn } = useContext(WebsocketContext);
  const [users, setUsers] = useState<Array<{ username: string }>>([]);
  const { user } = useContext(AuthContext);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (conn === null) {
      router.push("/");
      return;
    }

    const roomId = conn.url.split("/")[5];
    async function getUsers() {
      try {
        const res = await fetch(`${API_URL}/ws/getClients/${roomId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        setUsers(data);
      } catch (e) {
        console.error(e);
      }
    }
    getUsers();
  });

  useEffect(() => {
    if (textarea.current) {
      autosize(textarea.current);
    }

    if (conn === null) {
      router.push("/");
      return;
    }

    conn.onmessage = (message) => {
      const m: Message = JSON.parse(message.data);

      if (m.content == "A new user has joined the room") {
        setUsers([...users, { username: m.username }]);
      }

      if (m.content == "user left the chat") {
        const deleteUser = users.filter((user) => user.username != m.username);
        setUsers([...deleteUser]);
        setMessage([...messages, m]);

        return;
      }

      user?.username == m.username ? (m.type = "self") : (m.type = "recv");
      setMessage([...messages, m]);
      console.log(messages);
    };

    conn.onclose = () => {};
    conn.onerror = () => {};
    conn.onopen = () => {};
  }, [textarea, messages, conn, users]);

  const sendMessage = () => {
    if (!textarea.current?.value) return;
    if (conn === null) {
      router.push("/");
      return;
    }

    conn.send(textarea.current.value);
    textarea.current.value = "";
  };

  const handleClose = () => {
    if (conn) {
      conn.send("user left the chat");
      router.push("/");
    }
  };

  return (
    <div className="background flex flex-row gap-x-3 p-8 w-full">
      <div className="navbar grid grid-rows-9 background w-[200px] rounded-md p-2">
        <div className=" row-span-2 flex p-5 mt-5">
          <div className="m-auto ">
            <img
              className="rounded-full size-[70px]  hover:shadow-circle-white cursor-pointer transition-shadow duration-300"
              src="./images/card.jpg"
            />
          </div>
        </div>
        <div className=" row-span-5">
          <div className="grid grid-rows-3 py-3 gap-y-5 ">
            <div className="row-span-1 px-2 py-5 text-white hover:bg-bg2 rounded-2xl">
              <Link href={"/"}>
                <div className="grid grid-cols-2 gap-0">
                  <div className="col-span-1 p-2 flex align-middle justify-center">
                    <FaHome className="size-[20px]" />
                  </div>
                  <div className="col-span-1 p-1 text-lg font-semibold flex align-middle text-left ml-[-10px]">
                    Home
                  </div>
                </div>
              </Link>
            </div>

            <div
              className="row-span-1 px-2 py-5 text-white rounded-2xl"
              style={{
                backgroundColor:
                  pathname === "/app"
                    ? "rgba(219, 230, 253, 0.2)"
                    : "transparent",
              }}
            >
              <Link href={"/app"}>
                <div className="grid grid-cols-2 gap-0">
                  <div className="col-span-1 p-2 flex align-middle justify-center">
                    <IoChatbubbleEllipsesSharp className="size-[20px]" />
                  </div>
                  <div className="col-span-1 p-1 text-lg font-semibold flex align-middle text-left ml-[-10px]">
                    Chat
                  </div>
                </div>
              </Link>
            </div>

            <div className="row-span-1 px-2 py-5 text-white hover:bg-bg2  rounded-2xl">
              <Link href={"/settings"}>
                <div className="grid grid-cols-2 gap-0  ">
                  <div className="col-span-1 p-2 flex align-middle justify-center">
                    <IoMdSettings className="size-[20px]" />
                  </div>
                  <div className="col-span-1 p-1 text-lg font-semibold flex align-middle text-left ml-[-10px]">
                    Settings
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="row-span-2 ">
          <div className="flex justify-center align-middle px-2 py-4 text-white hover:bg-bg2 rounded-2xl h-[80px]">
            <Link href={"/"} onClick={handleClose}>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-1 p-3 flex align-middle justify-center">
                  <ImExit className="size-[20px]" />
                </div>
                <div className="col-span-1 p-2 text-lg font-semibold flex align-middle text-left ml-[-10px]">
                  Exit
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white w-full rounded-2xl">
        <div className="grid grid-rows-[50px_auto_60px] gap-2 h-full p-1">
          <div className="header col-span-1 text-center">
            <h3 className="">Room name</h3>
            <p>
              {users.length > 1
                ? `${users.length} active users`
                : "1 active user"}
            </p>
          </div>
          <div className="chat  col-span-1">
            <ChatBody data={messages} />
          </div>

          <div className=" flex p-3  align-center">
            <div className="flex w-full h-10 mr-2  rounded-md border border-blue">
              <textarea
                ref={textarea}
                placeholder="type your mesage here"
                className="w-full p-1 rounded-md focus:outline-none"
                style={{ resize: "none" }}
              />
            </div>
            <div className="flex items-center">
              <button
                className="p-2 rounded-md bg-blue text-white"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
