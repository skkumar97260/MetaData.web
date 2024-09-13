

export const saveToken = (data) => {
  localStorage.setItem("token", data?.token);
  localStorage.setItem("loginType", data?.loginType);

  if (data?.userId) {
    localStorage.setItem(
      "userId",
      data?.userId, "project"
    );
  } 
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getLoginType = () => {
  return localStorage.getItem("loginType");
};

export const getUserId = () => {
  const userId = localStorage.getItem("userId");
  
  return userId;
};



export const clearStorage = () => {
  localStorage.clear();
};
