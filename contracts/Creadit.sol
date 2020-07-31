// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.4.21 <0.7.0;

contract Creadit {

  address public owner;

  uint256 public handlePrice = 0.05 ether;

  mapping (string => uint64) public spaceIdByHandle;

  uint64 public nextSpaceId = 1;

  mapping (uint64 => Space) public spaceById;

  mapping (string => Post) public postById;

  mapping (
    string /* post id */ =>
    mapping (address /* buyer */ => uint256 /* paid amount */ )
  ) public paidForPost;

  struct Space {
    address owner;
    address payable wallet;
    string orbitdbAddress;
    string handle;
  }

  struct Post {
    uint64 spaceId;
    uint256 price;
  }

  event PaidForPost(address buyer, string postId);
  event ChangedSpaceHandle(address editor, uint64 spaceId);

  constructor() public {
    owner = msg.sender;
  }

  // function onlySpaceOwner(uint64 spaceId) internal view returns (Space memory space) {
  //   space = spaceById[spaceId];
  //   require(msg.sender == space.owner, 'Only space owner can do this');
  // }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only contract owner can do this');
    _;
  }

  function onlySpaceOwner(Space memory space) internal view {
    require(msg.sender == space.owner, 'Only space owner can do this');
  }

  function registerSpace(
    string memory orbitdbAddress
  ) public {
    registerSpace(orbitdbAddress, msg.sender);
  }

  // TODO verify a signature of the owner of orbit storage.
  function registerSpace(
    string memory orbitdbAddress,
    address payable wallet
  ) public {

    require(bytes(orbitdbAddress).length > 0, 'OrbitDB address is empty');

    require(wallet != address(0), 'Wallet address is zero');

    uint64 spaceId = nextSpaceId;
    nextSpaceId += 1;
    spaceById[spaceId] = Space({
      owner: msg.sender,
      wallet: wallet,
      orbitdbAddress: orbitdbAddress,
      handle: ''
    });
  }

  function setOrbitdbAddress(
    uint64 spaceId,
    string memory orbitdbAddress
  ) public {
    Space storage space = spaceById[spaceId];
    onlySpaceOwner(space);
    space.orbitdbAddress = orbitdbAddress;
  }

  function setSpaceWallet(
    uint64 spaceId,
    address payable wallet
  ) public {
    Space storage space = spaceById[spaceId];
    onlySpaceOwner(space);
    space.wallet = wallet;
  }

  function setPricePerView(
    uint64 spaceId,
    string memory postId,
    uint256 price
  ) public {
    Space memory space = spaceById[spaceId];
    onlySpaceOwner(space);
    postById[postId] = Post({ spaceId: spaceId, price: price });
  }

  function payPerView(
    string memory postId
  ) public payable {
    Post memory post = postById[postId];
    require(msg.value >= post.price, 'Not enough funds to pay per view');

    Space memory space = spaceById[post.spaceId];
    space.wallet.transfer(msg.value);
    paidForPost[postId][msg.sender] += msg.value;

    emit PaidForPost(msg.sender, postId);
  }

  function setHandlePrice(
    uint256 price
  ) public onlyOwner {
    handlePrice = price;
  }

  function setSpaceHandle(
    uint64 spaceId,
    string memory handle
  ) public payable {
    Space storage space = spaceById[spaceId];
    onlySpaceOwner(space);

    string memory lowerHandle = _strToLower(handle);
    require(spaceIdByHandle[lowerHandle] == 0, 'Handle is already taken');

    bool spaceHasHandle = bytes(space.handle).length > 0;
    if (spaceHasHandle) {
      // In this case we a changing a hadle of this space to a new one.
      // Let's release a current handle:
      spaceIdByHandle[space.handle] = 0;

      // Return any sent amount, such as you need to pay for a space handle once:
      if (msg.value > 0) {
        msg.sender.transfer(msg.value);
      }
    } else {
      // Space hasn't purchased a handle before.
      // Buy a handle for this space for the first time:
      require(msg.value >= handlePrice, 'Not enough funds to buy a space handle');
    }

    // Register a new handle for this space:
    spaceIdByHandle[lowerHandle] = spaceId;
    space.handle = lowerHandle;

    emit ChangedSpaceHandle(msg.sender, spaceId);
  }

  // Found this utility function here: https://gist.github.com/ottodevs/c43d0a8b4b891ac2da675f825b1d1dbf#gistcomment-3310614
  function _strToLower(string memory str) internal pure returns (string memory) {
    bytes memory bStr = bytes(str);
    bytes memory bLower = new bytes(bStr.length);
    for (uint i = 0; i < bStr.length; i++) {
      // Uppercase characters:
      if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
        // So we add 32 to make it lowercase
        bLower[i] = bytes1(uint8(bStr[i]) + 32);
      } else {
        bLower[i] = bStr[i];
      }
    }
    return string(bLower);
  }
}
