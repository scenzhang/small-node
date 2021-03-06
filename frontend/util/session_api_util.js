
export function signup({email, password, name, blurb}) {
  return $.ajax({
    method: 'post',
    url: 'api/users',
    data: { email, password, name, blurb }
  });
}

export function fetchCurrentUser() {
  return $.ajax({
    method: 'get',
    url: 'api/currUser'
  });
}

export function login({email, password}) {
  return $.ajax({
    method: 'post',
    url: 'login',
    data: { username: email, password }
  });
}

export function logout() {
  return $.ajax({
    method: 'get',
    url: '/logout'
  })
}