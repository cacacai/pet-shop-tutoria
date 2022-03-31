App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    //https://mirror.xyz/0xABae923874F05e922A22932d8d2117ffE627212d/4irYCy6U6BpejAHDAMY_dIdzNi0l9ScNpf6WD_loysY
    if (window.etherem) {
      try {
        //获取钱包授权
        await windown.etherem.enable();
      }catch(error) {
        console.log(error,"获取授权失败")
      }
    }
    // 传统的dapp浏览器 
    else if (window.web3){
      App.web3Provider = window.web3.currentProvider
    }else {
      //如果没有检测到注入的 web3 实例，则回退到 Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');

    }
    web3 = new Web3(App.web3Provider)
    return App.initContract();
  },

  initContract: function() {
    //实例化合约
    //载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
    $.getJSON('Adoption.json',(data) => {
      // 用Adoption.json数据创建一个可交互的TruffleContract合约实例
      var AdoptionArtifact = data;
      //使用 TruffleContract 进行实例化
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      //给合约注入区块链入口
      App.contracts.Adoption.setProvider(App.web3Provider);
      return App.markAdopted();
    })
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    /*
     * 处理领养
     */
    var adoptionInstance;
    //在实例部署之后，的回调事件中
    App.contracts.Adoption.deployed().then((instance) =>{
      adoptionInstance = instance;
      //调用合约的getAdopters()方法，用call 读取信息不用消耗gas
      return adoptionInstance.getAdopeters().call();
    }).then((adopters) => {
      for (let i = 0; i < adopters.length; i++) {
        if([adopters[i] !== '0x0000000000000000000000000000000000000000']) {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
        
      }
    }).catch((error) => {
      console.log(error)
    })

    
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * 处理领养事件
     */
    var adoptionInstance;
    web3.eth.getAccounts((error,acounts) => {
      if(error) {
        console.log(error)
      }
      var acount = acounts[0]
      //发起交易
      App.contracts.Adoption.deployed().then((instance) => {
        adoptionInstance = instance
        //调用交易
        return adoptionInstance.adopet(petId,{from: acount})
      }).then((result) => {
        //被领养，标记
        return App.markAdopted()
      }).catch((error) => {
        console.log(error)
      })
    })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
