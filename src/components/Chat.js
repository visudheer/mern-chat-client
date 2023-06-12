import React, { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import axios from "../axios";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../firebase";
import { useParams } from "react-router-dom";
import { AiOutlineSend } from "react-icons/ai";
import "../styles/Chat.css";
import { apiAuth } from "../config";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUsermessage] = useState("");
  const { room, id } = useParams();
  const chatboxRef = useRef();

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }

    const pusher = new Pusher(process.env.REACT_APP_PUSHER_TOKEN, {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("message");
    channel.bind("inserted", (data) => {
      setMessages([...messages, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  useEffect(() => {
    axios.get("/getmessages", apiAuth).then((res) => {
      setMessages(
        res.data.filter(
          (item) =>
            (item.senderemail === auth.currentUser?.email &&
              item.receiveremail === atob(room)) ||
            (item.senderemail === atob(room) &&
              item.receiveremail === auth.currentUser?.email)
        )
      );
    });
  }, [room]);

  const sendInfo = async (e) => {
    e.preventDefault();
    if (auth.currentUser?.email === "" && userMessage === "")
      return alert("empty inputs");
    await axios.post(
      "/postmessage",
      {
        id: uuidv4(),
        senderemail: auth.currentUser?.email,
        receivername: atob(id),
        sendername: auth.currentUser?.displayName,
        receiveremail: atob(room),
        message: userMessage,
        timestamp:
          new Date().toLocaleDateString() +
          " " +
          new Date().toLocaleTimeString(),
      },
      apiAuth
    );

    setUsermessage("");
  };

  return (
    <>
      <div className="chat_container">
        <div className="chat_window">
          <div className="receiver_container">
            <p>
              <span>{atob(id)}</span> <br /> {atob(room)}
            </p>
          </div>
          <div className="chat_box" ref={chatboxRef}>
            {messages.map((message) => {
              return (
                <div className="message">
                  <div className="message_box">
                    <p
                      className={`chat_message ${
                        message?.senderemail === auth.currentUser?.email &&
                        "chat_sender"
                      }`}
                    >
                      {message.message}
                      <span className="message_time">{message.timestamp}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <form className="chat_form" action="">
            <input
              value={userMessage}
              onChange={(e) => setUsermessage(e.target.value)}
              placeholder="Enter your message"
            />
            <button onClick={sendInfo}>
              Send <AiOutlineSend size={17} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chat;
