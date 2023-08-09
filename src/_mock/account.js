// ----------------------------------------------------------------------

const account = {...JSON.parse(localStorage.getItem('user', '{}')), photoURL: '/assets/images/avatars/avatar_default.jpg'};
account.displayName = account.name;

export default account;
