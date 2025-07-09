
function initVkBridgeApp() {
	vkBridge.send("VKWebAppInit", {});
}

function friendsInvite() {
	vkBridge.send('VKWebAppGetFriends')
  .then((data) => { 
    if (data) {
      // Данные о пользователях
      alert(data.users);
      console.log(data.users);
    }
  })
  .catch((error) => {
    // Ошибка
    console.log(error);
  });
}

function setupApp(appDataCallback) {
  vkBridge.send('VKWebAppGetLaunchParams')
  .then((data) => { 
    if (data.vk_user_id) {
      auth(data.vk_user_id, function(authData) {

      console.log(data); 
      // Параметры запуска получены
      appDataCallback(authData)
});
    }
  })
  .catch((error) => {
    // Ошибка
    console.log(error);
  });
}

function auth(userId,authCallback) {
  vkBridge.send('VKWebAppGetUserInfo', {
  user_id: userId
  })
  .then((data) => { 
    if (data.id) {
      // Данные пользователя получены
      console.log(data); 
      authCallback(data);     
    }
  })
  .catch((error) => {
    // Ошибка
    console.log(error);
  });
}