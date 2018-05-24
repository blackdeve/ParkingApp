import * as types from '../types';
import { signin, signup, _update, _updateWithoutPhoto, getUser, getVehicles, getSpots } from '../../api';
import * as RealmDB from '../realm';

// ACTIONS
export const setUser = (user) => {
  const action = {
    type: types.SET_USER_SESSION,
    user
  };
  return action;
}

export function loadData(username) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      // Get vehicles after successful login
      getVehicles(username)
      .then((res1) => {
        res1.json().then((json1) => {
          const vehicles = json1.vehicles
          vehicles.map((vehicle) => {
            RealmDB.createVehicleItem(vehicle)
          })
        })
      })
      // Get spots after successful login
      getSpots()
      .then(res2 => {
        res2.json().then(json2 => {
          const spots = json2.spots
          spots.map((spot) => {
            RealmDB.createSpotItem(spot)
          })
          resolve()
        })
      })
    })
  }
}

export function login(username, password) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      signin(username, password)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            resolve(json.user);
            // Get vehicles after successful login
            getVehicles(username)
            .then((res1) => {
              res1.json().then((json1) => {
                const vehicles = json1.vehicles
                vehicles.map((vehicle) => {
                  RealmDB.createVehicleItem(vehicle)
                })
              })
            })
            // Get spots after successful login
            getSpots()
            .then(res2 => {
              res2.json().then(json2 => {
                const spots = json2.spots
                spots.map((spot) => {
                  RealmDB.createSpotItem(spot)
                })
              })
            })
          } else {
            reject(json.msg);
          }
        })
      })
      .catch((err) => {
        reject(err);
      });
    });
  };
}

export function logout() {
  return (dispatch) => {
    dispatch(setUser(null));
  }
}

export function register(firstname, lastname, email, photo, phone, username, password) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      signup(firstname, lastname, email, photo, phone, username, password)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            resolve();
          } else {
            reject(json.msg);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}

export function update(id, firstname, lastname, email, photo, phone, username, password) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      _update(id, firstname, lastname, email, photo, phone, username, password)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            resolve(json.user);
          } else {
            reject(json.msg);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}

export function updateWithoutPhoto(id, firstname, lastname, email, phone, username, password) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      _updateWithoutPhoto(id, firstname, lastname, email, phone, username, password)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            resolve(json.user);
          } else {
            reject(json.msg);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}

export function getUserInfo(username) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      getUser(username)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            resolve(json.user);
          } else {
            reject(json.msg);
          }
        })
      })
      .catch((err) => {
        console.log(err);
      })
    })
  }
}