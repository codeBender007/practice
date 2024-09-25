import { Avatar, Box, Flex, Link, Portal, Menu, MenuButton, MenuItem, MenuList, Text, VStack, Button } from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import '../index.css' 
import { CgMoreO } from "react-icons/cg";
import { useToast } from "@chakra-ui/react";
import { useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom";
import {Link as RouterLink} from "react-router-dom"
import { useState } from "react";
import useShowToast from "../hooks/useShowToast";

export default function UserHeader({user}) {

    const toast = useToast();
    const currentUser = useRecoilValue(userAtom);
    const [following , setFollowing] = useState(user.followers.includes(currentUser?._id))
    const showToast = useShowToast();
    const [updating , setUpdating] = useState(false);

    const copyURL = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL)
            .then(() => {
                // Create an example promise that resolves in 5s
                const examplePromise = new Promise((resolve, reject) => {
                    setTimeout(() => resolve(200), 5000);
                });

                // Display the loading toast until the promise is either resolved or rejected
                toast.promise(examplePromise, {
                    success: { title: 'Profile Link copied' },
                    error: { title: 'Promise rejected', description: 'Something went wrong' },
                    loading: { title: 'Promise pending', description: 'Please wait' },
                });

                console.log("URL copied");
            })
            .catch(() => {
                toast({
                    title: "Error copying URL",
                    description: "Failed to copy the URL.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            });
    };

    const handleFollowUnfollow = async() =>{

        if(!currentUser){
            showToast("Error" , "Please login to follow")
            return;
        }

        if(updating) return;

        setUpdating(true);
        try{
            const res = await fetch(`/api/users/follow/${user._id}`,{
                method:"POST",
                headers:{
                    "Content_Type":"application/json",
                },
            });
            const data = await res.json();
            if(data.error){
                showToast("Error" , data.error , "error");
                return;
            }

            if(following){
                showToast("Success" , `Unfollowed ${user.name}` , "success");
                user.followers.pop();
            }
            else{
                showToast("Success" , `Followed ${user.name}` , "success");
                user.followers.push(currentUser?._id);
            }

            setFollowing(!following);
            console.log("data : ",data);
        }
        catch(error){
            showToast("Error" , error , "error");
        }
        finally{
            setUpdating(false);
        }
    }

  return (
    <VStack gap={4} alignItems={"start"}>
        <Flex justifyContent={"space-between"} w={"full"}>
            <Box>
                <Text fontSize={'2xl'} fontWeight={'bold'} >{user.name}</Text>
                <Flex gap={2} alignItems={"center"}>
                      <Text fontSize={"sm"}>{user.username}</Text>
                      <Text fontSize={'xs'} bg={'gray.dark'} color={'gray.light'} p={1} borderRadius={'full'} >thread.net</Text>
                </Flex>
            </Box>
            <Box>
                {user.profilePic && (
                      <Avatar
                          name={user.name}
                          src={user.profilePic}
                          size={{ base: 'md', md: 'xl' }}
                      />
                )}
                  {!user.profilePic && (
                      <Avatar
                          name={user.name}
                          src="https://bit.ly/broken-link"
                          size={{ base: 'md', md: 'xl' }}
                      />
                  )}
            </Box>
        </Flex>

          <Text>{user.bio}</Text>

          {currentUser?._id === user._id && (
            <Link as={RouterLink} to="/update">
                <Button size={"sm"} >update Profile</Button>
            </Link>
          )}
          {currentUser?._id !== user._id && (
                  <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating} >
                    {following ? "Unfollow" : "Follow"}
                  </Button>
          )}
        <Flex w={'full'} justifyContent={'space-between'} >
            <Flex gap={2} alignItems={'center'} >
                  <Text color={'gray.light'}>{user.followers.length} followers</Text>
                <Box w={'1'} h={'1'} bg={'gray.light'} borderRadius={'full'}></Box>
                  <Link href="https://www.instagram.com/?hl=en" color={"gray.light"} >instagram</Link>
            </Flex>
            <Flex>
                <Box className="icon-container">
                    <BsInstagram size={24} cursor={'pointer'} />
                </Box>
                  <Box className="icon-container">
                    <Menu>
                        <MenuButton>
                              <CgMoreO size={24} cursor={'pointer'} />
                        </MenuButton>
                        <Portal>
                          <MenuList bg={'gray.dark'}>
                                  <MenuItem onClick={copyURL} bg={'gray.dark'}>Copy Link</MenuItem>
                          </MenuList>
                        </Portal>
                    </Menu>
                  </Box>
            </Flex>
        </Flex>

        <Flex w={'full'}>
            <Flex flex={1} borderBottom={'1.5px solid white'} justifyContent={'center'} pb='3' cursor={'pointer'}>
                <Text fontWeight={'bold'}>Threads</Text>
            </Flex>
            <Flex flex={1} borderBottom={'1px solid gray'} justifyContent={'center'} pb='3' color={'gray.light'} cursor={'pointer'}>
                <Text fontWeight={'bold'}>Replies</Text>
            </Flex>
        </Flex>

    </VStack>
  )
}
