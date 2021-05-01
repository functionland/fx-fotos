export const getUserInfo = (username: string, password: string) => {
  console.log(username, password);
  let user = {
    name: 'Test User',
    email: 'testuser@gmail.com',
    token: '',
  };
  return user;
};

export const getUserBoxMedia = (userToken: string) => {
  console.log('Box Media Fetched');
  let boxMedia = [];
  return boxMedia;
};