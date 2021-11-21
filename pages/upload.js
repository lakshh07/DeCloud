import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Flex,
  Stack,
  Button,
  Box,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  FormControl,
  FormLabel,
  Input,
  ButtonGroup,
  Badge,
  useDisclosure,
  chakra,
  VisuallyHidden,
  useColorModeValue,
  InputGroup,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { BsCloudUploadFill } from "react-icons/bs";
import { AiFillFileAdd } from "react-icons/ai";
import * as IPFS from "ipfs-core";
import { useRouter } from "next/router";

function UploadFile({ deContract, contractAddress }) {
  const router = useRouter();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [checker, setChecker] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hash, setHash] = useState("");
  const toast = useToast();
  const [{ name, file }, setFile] = useState({
    name: <Icon as={AiFillFileAdd} />,
    file: "",
  });
  //   const [newFile, setNewFile] = useState({
  //     title: "",
  //     description: "",
  //   });

  const [description, setDescription] = useState("");

  const updateField = (e) => {
    // e.prevent.default;
    setNewFile({
      ...newFile,
      [e.target.name]: e.target.value,
    });
  };

  let NewBuffer;
  const handleFile = (e) => {
    if (e.target.files[0]) {
      setFile({
        file: e.target.files[0],
        name: e.target.files[0].name,
      });
    }

    const reader = new window.FileReader();

    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onloadend = () => {
      NewBuffer = Buffer(reader.result);
      console.log("buffer", NewBuffer);
    };
  };
  useEffect(() => {
    success &&
      toast({
        title: "Transaction Hash.",
        description: hash,
        status: "success",
        position: "top",
        duration: 9000,
        isClosable: true,
      });
    checker &&
      toast({
        title: "Please Wait!",
        description: "Submitting file to IPFS...",
        status: "info",
        position: "top",
        duration: 5000,
        isClosable: true,
      });
  }, [success, checker]);

  async function uploadingFile() {
    setChecker(true);
    if (typeof window.ethereum !== "undefined") {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        deContract.abi,
        signer
      );

      let overrides = {
        from: account,
      };

      const fileDetails = name.split(".");
      const fileSize = file.size / 1000;
      console.log("1", fileDetails[0]);
      console.log("2", fileDetails[1]);
      console.log("3", fileSize);

      const fileDes = description == "" ? fileDetails[0] : description;

      console.log(fileDes, "ff");

      const ipfs = await IPFS.create();
      const { cid, size } = await ipfs.add(file);
      console.info("cid", cid.toString(), size);

      const result = await contract.uploadFile(
        cid.toString(),
        size,
        fileDetails[1],
        fileDetails[0],
        fileDes,
        overrides
      );
      console.log(result.hash);
      setHash(result.hash);
      setSuccess(true);
    }
    console.log("Submitting file to IPFS...");
    setInterval(() => {
      router.reload();
    }, 15000);
  }

  const Form = ({ onCancel }) => {
    return (
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>File Description (Optional)</FormLabel>
          <InputGroup>
            <Input
              fontFamily="Inter"
              type="text"
              placeholder="Short Description"
              focusBorderColor="gray.700"
              rounded="md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </InputGroup>
        </FormControl>
        <Flex alignItems="center" mt={1}>
          <Badge m={0}>{name}</Badge>
          <chakra.label
            cursor="pointer"
            rounded="md"
            fontSize="md"
            ml={5}
            size="sm"
            fontWeight="medium"
            color={useColorModeValue("brand.600", "brand.200")}
            pos="relative"
            _hover={{
              color: useColorModeValue("brand.400", "brand.300"),
            }}
          >
            <span>Upload a file</span>
            <VisuallyHidden>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="*"
                onChange={handleFile}
              />
            </VisuallyHidden>
          </chakra.label>
        </Flex>
        <ButtonGroup d="flex" justifyContent="flex-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button colorScheme="purple" onClick={uploadingFile}>
            {checker && <Spinner mr={4} />}
            {checker ? "Uploading to IPFS" : "Upload"}
          </Button>
        </ButtonGroup>
      </Stack>
    );
  };
  return (
    <>
      <Popover
        isLazy
        placement="top"
        closeOnBlur={false}
        isOpen={isOpen}
        onOpen={onOpen}
      >
        <PopoverTrigger>
          <Box cursor="pointer" className="upload-icon">
            <Icon as={BsCloudUploadFill} boxSize={8} color="white" />
          </Box>
        </PopoverTrigger>
        <PopoverContent className="blur">
          <PopoverArrow />
          <PopoverArrow />
          <PopoverBody fontFamily="Lato">
            {" "}
            <Form onCancel={onClose} />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default UploadFile;
