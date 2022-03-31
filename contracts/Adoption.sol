// SPDX-License-Identifier: MIT
pragma solidity  >=0.4.22 <0.9.0;
contract Adoption {
    address[16] public adopters;//保存领养的者的地址

    // 领养宠物
    function adopet (uint petId) public returns(uint) {
        require(petId >=0 && petId <15);
        adopters[petId] = msg.sender;
        return petId;
    }

    //返回领养动物
    function getAdopeters() public view returns(address[16] memory) {
        return adopters;
    }

}
