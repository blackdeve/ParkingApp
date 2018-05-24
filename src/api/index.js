import apiConfig from './config';

const endPoints = {
  // USER ENDPOINTS
  SIGNIN: 'user/login',
  SIGNUP: 'user/register',
  UPDATE: 'user/update',
  UPDATE_WITHOUT_PHOTO: 'user/updateWithoutPhoto',
  GET_USER: 'user',
  // VEHICLE ENDPOINTS
  ADD_VEHICLE: 'vehicle/add',
  UPDATE_VEHICLE: 'vehicle/update',
  DELETE_VEHICLE: 'vehicle/remove',
  GET_VEHICLES: 'vehicle',
  // SPOT ENDPOINTS
  ADD_SPOT: 'spot/add',
  UPDATE_SPOT: 'spot/update',
  DELETE_SPOT: 'spot/remove',
  GET_SPOTS: 'spot',
  GET_TOP_SPOTS: 'spot/top',
  // RESERVATION ENDPOINTS
  RESERVE_SPOT: 'reservation/new',
  GET_RESERVATION_BY_SPOT_ID: 'reservation/spotid',
  GET_ALL_RESERVATIONS: 'reservation',
  GET_MY_RESERVATIONS: 'reservation/mine',
  GET_RENTER_RESERVATIONS: 'reservation/renter'
}

/**
 * USER FUNCTIONS
 */

export const signin = (username, password) => {
  const apiUrl = `${apiConfig.url}${endPoints.SIGNIN}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  })
}

export const signup = (firstname, lastname, email, photo, phone, username, password) => {
  let formdata = new FormData();
  formdata.append('firstname', firstname);
  formdata.append('lastname', lastname);
  formdata.append('email', email);
  formdata.append('phone', phone);
  formdata.append('username', username);
  formdata.append('password', password);
  formdata.append('photo', photo);
  const apiUrl = `${apiConfig.url}${endPoints.SIGNUP}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: formdata
  })
}

export const _update = (id, firstname, lastname, email, photo, phone, username, password) => {
  let formdata = new FormData();
  formdata.append('id', id);
  formdata.append('firstname', firstname);
  formdata.append('lastname', lastname);
  formdata.append('email', email);
  formdata.append('phone', phone);
  formdata.append('username', username);
  formdata.append('password', password);
  formdata.append('photo', photo);
  const apiUrl = `${apiConfig.url}${endPoints.UPDATE}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: formdata
  })
}

export const _updateWithoutPhoto = (id, firstname, lastname, email, phone, username, password) => {
  const apiUrl = `${apiConfig.url}${endPoints.UPDATE_WITHOUT_PHOTO}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({
      id,
      firstname,
      lastname,
      email,
      phone,
      username,
      password
    })
  })
}

export const getUser = (username) => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_USER}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username
    })
  })
}

/**
 * VEHICLE FUNCTIONS
 */

export const newVehicle = (username, make, model, plate, color, picture) => {
  let formdata = new FormData();
  formdata.append('username', username);
  formdata.append('make', make);
  formdata.append('model', model);
  formdata.append('plate', plate);
  formdata.append('color', color);
  formdata.append('picture', picture);
  const apiUrl = `${apiConfig.url}${endPoints.ADD_VEHICLE}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: formdata
  })
}

export const editVehicle = (id, username, make, model, plate, color, picture) => {
  let formdata = new FormData();
  formdata.append('id', id);
  formdata.append('username', username);
  formdata.append('make', make);
  formdata.append('model', model);
  formdata.append('plate', plate);
  formdata.append('color', color);
  formdata.append('picture', picture);
  const apiUrl = `${apiConfig.url}${endPoints.UPDATE_VEHICLE}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: formdata
  })
}

export const removeVehicle = (id) => {
  const apiUrl = `${apiConfig.url}${endPoints.DELETE_VEHICLE}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id})
  })
}

export const getVehicles = (username) => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_VEHICLES}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username
    })
  })
}

/**
 * SPOT FUNCTIONS
 */

 export const newSpot = (username, position, name, location, type,
        description, image, availability, from, to, startDate, endDate, rate) => {
  let formdata = new FormData();
  formdata.append('username', username);
  formdata.append('position', JSON.stringify(position));
  formdata.append('name', name);
  formdata.append('location', location);
  formdata.append('type', type);
  formdata.append('description', description);
  formdata.append('image', image);
  formdata.append('availability', JSON.stringify(availability));
  formdata.append('from', from);
  formdata.append('to', to);
  formdata.append('startDate', startDate);
  formdata.append('endDate', endDate);
  formdata.append('rate', rate);
  const apiUrl = `${apiConfig.url}${endPoints.ADD_SPOT}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: formdata
  })
}

 export const editSpot = (id, position, name, location, type,
        description, image, availability, from, to, startDate, endDate, rate) => {
  let formdata = new FormData();
  formdata.append('id', id);
  formdata.append('position', JSON.stringify(position));
  formdata.append('name', name);
  formdata.append('location', location);
  formdata.append('type', type);
  formdata.append('description', description);
  formdata.append('image', image);
  formdata.append('availability', JSON.stringify(availability));
  formdata.append('from', from);
  formdata.append('to', to);
  formdata.append('startDate', startDate);
  formdata.append('endDate', endDate);
  formdata.append('rate', rate);
  const apiUrl = `${apiConfig.url}${endPoints.UPDATE_SPOT}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: formdata
  })
}

 export const removeSpot = (id) => {
  const apiUrl = `${apiConfig.url}${endPoints.DELETE_SPOT}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id})
  })
}

export const getSpots = () => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_SPOTS}`;
  return fetch(apiUrl, {
    method: 'GET'
  })
}

export const getTopSpots = (username, date) => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_TOP_SPOTS}`
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      date
    })
  })
}

/**
 * CAR FUNCTIONS
 */

export const carMakes = () => {
  const makesUrl = 'https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes&year=2017&sold_in_us=1';
  return fetch(makesUrl, {
    method: 'GET'
  })
}

export const carModels = (make) => {
  const modelsUrl = 'https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=' + make + '&sold_in_us=1';
  return fetch(modelsUrl, {
    mothod: 'GET'
  })
}

/**
* RESERVATION FUNCTIONS
*/

export const newReservation = (username, spotId, date, from, to) => {
  const apiUrl = `${apiConfig.url}${endPoints.RESERVE_SPOT}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      spotId,
      date,
      from,
      to
    })
  })
}

export const getReservationBySpotId = (spotId) => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_RESERVATION_BY_SPOT_ID}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      spotId
    })
  })
}

export const getReservations = () => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_ALL_RESERVATIONS}`;
  return fetch(apiUrl, {
    method: 'GET'
  })
}

export const getMyReservations = (username) => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_MY_RESERVATIONS}`
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username
    })
  })
}

export const getRenterReservations = (username) => {
  const apiUrl = `${apiConfig.url}${endPoints.GET_RENTER_RESERVATIONS}`
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username
    })
  })
}