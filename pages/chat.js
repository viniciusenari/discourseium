import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React from "react";
import appConfig from "../config.json";
import { FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMxMzYzMSwiZXhwIjoxOTU4ODg5NjMxfQ.c6cHqSkB_BAtxd-JQgDqwTPXFzNaUJMs7tTFEeqswmI";
const SUPABASE_URL = "https://rdpwldwghmviaxprwgnc.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function realTimeMessageCatcher(addMessage) {
  return supabaseClient
    .from("messages")
    .on("INSERT", (liveResponse) => {
      addMessage(liveResponse.new);
    })
    .subscribe();
}

export default function ChatPage() {
  const router = useRouter();
  const username = router.query.username;
  const [message, setMessage] = React.useState("");
  const [messageList, setMessageList] = React.useState([]);

  React.useEffect(() => {
    supabaseClient
      .from("messages")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        setMessageList(data);
      });

    const subscription = realTimeMessageCatcher((newMessage) => {
      setMessageList((currentMessageList) => {
        return [newMessage, ...currentMessageList];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function handleNewMessage(newMessage) {
    if (newMessage !== "") {
      const message = {
        from: username,
        text: newMessage,
      };

      supabaseClient
        .from("messages")
        .insert([message])
        .then(({ data }) => {});

      setMessage("");
    }
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/10/international-space-station-cupola.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList
            messages={messageList}
            setMessageList={setMessageList}
            username={username}
          />
          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={message}
              onChange={(event) => {
                const valor = event.target.value;
                setMessage(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleNewMessage(message);
                }
              }}
              placeholder="Write your message here..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <Button
              styleSheet={{
                padding: "0 3px 0 0",
                minWidth: "50px",
                minHeight: "40px",
                fontSize: "20px",
                marginBottom: "8px",
                marginRight: "8px",
                lineHeight: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: appConfig.theme.colors.neutrals[300],
                hover: {
                  filter: "grayscale(1)",
                },
              }}
              label="Send"
              type="submit"
              colorVariant="neutral"
              onClick={(event) => {
                event.preventDefault();
                handleNewMessage(message);
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNewMessage(":sticker: " + sticker);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.messages.map((message) => {
        return (
          <Text
            key={message.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${message.from}.png`}
              />
              <Text tag="strong">{message.from}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>

              <DeleteButton
                message={message}
                messages={props.messages}
                setMessageList={props.setMessageList}
                username={props.username}
              />
            </Box>
            {message.text.startsWith(":sticker:") ? (
              <Image src={message.text.replace(":sticker:", "")} />
            ) : (
              message.text
            )}
          </Text>
        );
      })}
    </Box>
  );
}

function DeleteButton(props) {
  function deleteMessage(id) {
    try {
      supabaseClient
        .from("messages")
        .delete()
        .eq("id", id)
        .then(({ data }) => {
          console.log(data[0].id);
          const newMessageList = props.messages.filter(
            (message) => message.id !== data[0].id
          );
          props.setMessageList([...newMessageList]);
        });
    } catch (error) {
      alert(error.error_description || error.message);
    }
  }

  if (props.message.from === props.username) {
    return (
      <FaTrashAlt
        cursor="pointer"
        color="grey"
        onClick={(event) => {
          event.preventDefault();
          deleteMessage(props.message.id);
        }}
      />
    );
  } else {
    return null;
  }
}
