import * as types from '../types';
import { newSpot, editSpot, removeSpot, newReservation, getTopSpots } from '../../api';
import * as RealmDB from '../realm';

// ACTIONS
export function addSpot(username, position, name, location, type,
        description, image, availability, from, to, startDate, endDate, rate) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      newSpot(username, position, name, location, type,
        description, image, availability, from, to, startDate, endDate, rate)
        .then((res) => {
          res.json().then((json) => {
            if (json.success) {
              RealmDB.createSpotItem(json.spot)
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

export function updateSpot(id, position, name, location, type,
        description, image, availability, from, to, startDate, endDate, rate) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      editSpot(id, position, name, location, type,
        description, image, availability, from, to, startDate, endDate, rate)
        .then((res) => {
          res.json().then((json) => {
            if (json.success) {
              RealmDB.updateSpotItem(json.spot)
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

export function deleteSpot(id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      removeSpot(id)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            RealmDB.deleteSpotItem(id)
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

export function reserveSpot(username, spotId, date, from, to) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      newReservation(username, spotId, date, from, to)
        .then((res) => {
          res.json().then((json) => {
            if (json.success) {
              resolve();
            } else {
              reject(json.msg);
            }
          })
        })
    })
  }
}

export function GetTopSpots(username, date) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      getTopSpots(username, date)
        .then((res) => {
          res.json().then((json) => {
            resolve(json)
          })
        }, (err) => {
          reject()
        })
    })
  }
}