import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import "./styles/App.css";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "./axios";
import { TfiSearch } from "react-icons/tfi";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaUserCheck } from "react-icons/fa";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { apiAuth } from "./config";
import { IoChatbubblesOutline, IoCloseCircleOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import Login from "./components/Login";
import Chat from "./components/Chat";

const App = () => {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState([]);
  const [filteredusers, setFilteredusers] = useState([]);
  const [addedusers, setAddedusers] = useState([]);
  const [sidebarstate, setSidebarstate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_TOKEN, {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("currentuseremail");
    channel.bind("inserted", (data) => {
      setAddedusers([...addedusers, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [addedusers]);

  useEffect(() => {
    axios
      .get(`/getnewusers?useremail=${auth.currentUser?.email}`, apiAuth)
      .then((users) => setAddedusers(users.data));

    if (user) {
      axios.get("/getactiveusers", apiAuth).then((users) => {
        setUsers(users.data);
      });

      (async () => {
        await axios
          .post(
            "/activeuser",
            {
              name: auth.currentUser?.displayName,
              email: auth.currentUser?.email,
              imgUrl: auth.currentUser?.photoURL,
              timestamp:
                new Date().toLocaleDateString() +
                " " +
                new Date().toLocaleTimeString(),
            },
            {
              auth: {
                username: process.env.REACT_APP_APIAUTHUSER,
                password: process.env.REACT_APP_APIAUTHPASS,
              },
            }
          )
          .then(() => {
            console.log("SUCCESS");
          });
      })();
    } else {
      console.log("NO USER");
    }
  }, [user]);

  const addUser = (e, item) => {
    axios
      .post(
        "/newuser",
        {
          chatusername: item.name,
          chatuseremail: item.email,
          chatuserimgUrl: item.imgUrl,
          chatusertimestamp: item.timestamp,
          currentuseremail: auth.currentUser.email,
        },
        apiAuth
      )
      .catch((err) => console.log(err.message));
  };

  if (!user) return <Login />;
  return (
    <div className="app">
      <div className={`side_bar ${sidebarstate ? "sidebar_open" : ""}`}>
        <div className="search_bar">
          <div className="search_input_bar">
            <input
              className="search_input"
              type="text"
              onChange={(e) => {
                console.log("seee");
                setFilteredusers(
                  users.filter((item) => item.email.includes(e.target.value))
                );

                if (e.target.value === "") {
                  setFilteredusers([]);
                }
              }}
              placeholder="Search"
            />
            <TfiSearch />
          </div>

          <div className="add_userscontainer">
            {filteredusers.map((item) => {
              const existState = addedusers.find(
                (data) => data.chatuseremail === item.email
              );

              return (
                <div className="profile_container">
                  <img src={item.imgUrl} className="profile_image" alt="" />
                  <div className="profile_info">
                    <p className="profile_title">{item.name}</p>
                    <p className="profile_email">{item.email}</p>
                  </div>
                  {auth.currentUser.email === item.email ? (
                    <h5 style={{ margin: "0 10px", textAlign: "center" }}>
                      You
                    </h5>
                  ) : (
                    <button
                      disabled={existState === undefined ? false : true}
                      className="profile_button"
                      onClick={(e) => addUser(e, item)}
                    >
                      {existState === undefined ? (
                        <AiOutlineUserAdd size={17} />
                      ) : (
                        <FaUserCheck size={17} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="added_users">
          <h3 style={{ margin: "1rem 1rem" }}>Chats</h3>
          {addedusers.map((user) => {
            const bufferName = btoa(user.chatusername);
            const bufferEmail = btoa(user.chatuseremail);

            return (
              <Link
                style={{ textDecoration: "none" }}
                to={`/rooms/${bufferEmail}/${bufferName}`}
                onClick={() => setSidebarstate(false)}
              >
                <div className="profile_container">
                  <img
                    src={user.chatuserimgUrl}
                    className="profile_image"
                    alt=""
                  />
                  <div className="profile_info">
                    <p className="profile_title">{user.chatusername}</p>
                    <p className="profile_email">{user.chatuseremail}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {sidebarstate ? (
          <div
            onClick={() => setSidebarstate(false)}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "45%",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <IoCloseCircleOutline color="white" size={30} />
            Close
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="main_chatcontainer">
        <div className="current_profile">
          <IoChatbubblesOutline
            size={17}
            className="chats_bubble"
            onClick={() => setSidebarstate(true)}
          />
          <h5>
            <span>
              <CiUser size={20} />
            </span>
            {auth.currentUser?.displayName}
          </h5>
          <button
            onClick={() => {
              auth.signOut();
              navigate("/", {});
            }}
          >
            Sign out
          </button>
        </div>

        <Routes>
          <Route path="/rooms/:room/:id" Component={Chat} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
