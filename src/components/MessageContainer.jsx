import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import Message from './Message'
import MessageInput from './MessageInput'
import useShowToast from '../hooks/useShowToast'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { conversationsAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'
import messageSound from "../assets/sound/message.mp3"
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../App"



export default function MessageContainer() {

    const showToast = useShowToast();
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const [loadingMessages , setLoadingMessages] = useState(true);
    const [messages , setMessages] = useState([]);
    const currentUser = useRecoilValue(userAtom);
    const { socket } = useSocket();
    const setConversations = useSetRecoilState(conversationsAtom);
    const messageEndRef = useRef(null);

    useEffect(() => {
        socket.on("newMessage", (message) => {

            if(selectedConversation._id === message.conversationId){
                setMessages((prev) => [...prev, message]);

            }

            // if(!document.hasFocus()){
                const sound = new Audio(messageSound);
                sound.play();
            // }

            setConversations((prev) => {
                const updateConversations = prev.map(conversation => {
                    if (conversation._id === message.conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender,
                            }
                        }
                    }
                    return conversation;
                })
                return updateConversations;
            })

        });


        return () => socket.off("newMessage");
    },[socket]);


    useEffect(() => {
        messageEndRef.current?.scrollIntoView({behavior: "smooth"});
    })

    
    useEffect( () => {
        const getMessages = async () =>{
            setLoadingMessages(true);
            setMessages([]);
            try {
                if(selectedConversation.mock) return;
                const res = await fetch(`${API_BASE_URL}/api/messages/${selectedConversation.userId}`);
                const data = await res.json();
                if(data.error){
                    showToast("Error" , data.error , "error");
                    return;
                }
                setMessages(data);
            } catch (error) {
                showToast("Error" , error.Message , "error");
            }
            finally{
                setLoadingMessages(false);
            }
        }
        getMessages();
    },[showToast,selectedConversation.userId])

    const navigate = useNavigate();
    const handleVisitProfile = () => {
        navigate(`/${selectedConversation.username}`);
    };

  return (
    <Flex p={2} flex='70' bg={useColorModeValue("gray.200" , "gray.dark")} borderRadius={'md'} flexDirection={'column'} >
        <Flex w={'full'} h={12} alignItems={'center'} gap={2}>
            <Avatar onClick={handleVisitProfile} src={selectedConversation.userProfilePic} size={'sm'} />            
            <Text display={'flex'} alignItems={'center'} >
                  {selectedConversation.username} <Image src='/verified.png' w={4} h={4} ml={1} />
            </Text>
        </Flex>

        <Divider/>

        <Flex flexDir={'column'} px={2} gap={4} my={4}
            height={'400px'}
            overflowY={'auto'}
        >
            {loadingMessages && 
                [...Array(5)].map((_,i) => (
                    <Flex key={i} 
                        gap={2}
                        alignItems={'center'}
                        p={1}
                        borderRadius={'md'}
                        alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                    >
                        {i % 2 === 0 && <SkeletonCircle size={7} />}
                        <Flex flexDir={'column'} gap={2} >
                            <Skeleton h='8px' w='250px' />
                            <Skeleton h='8px' w='250px' />
                            <Skeleton h='8px' w='250px' />
                        </Flex>
                        {i % 2 !== 0 && <SkeletonCircle size={7} />}
                    </Flex>
                ))}
                
                {!loadingMessages && (
                    messages.map( (message) =>(
                        <Flex 
                        direction={'column'}
                         key={message._id}
                        ref={messages.length -1 === messages.indexOf(message) ? messageEndRef : null}
                         >
                            <Message message={message} ownMessage={currentUser._id === message.sender} />
                        </Flex>
                    ) )
                )}

        </Flex>
        <MessageInput setMessages={setMessages} />
    </Flex>
  )
}
