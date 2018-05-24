import Realm from 'realm';

/**
 * VehicleItem
 */
class VehicleItem {
  static schema = {
    name: 'VehicleItem',
    primaryKey: 'id',
    properties: {
      id: {
        type: 'int'
      },
      username: {
        type: 'string'
      },
      make: {
        type: 'string'
      },
      model: {
        type: 'string'
      },
      plate: {
        type: 'string'
      },
      color: {
        type: 'string'
      },
      picture: {
        type: 'string'
      }
    }
  }
  static get() {
    return realm.objects('VehicleItem');
  }
}

export const createVehicleItem = (vehicle) => {
  if (getVehicle(vehicle.id) !== undefined)
    return;
  realm.write(() => {
    realm.create(VehicleItem.schema.name, {
      id: vehicle.id,
      username: vehicle.username,
      make: vehicle.make,
      model: vehicle.model,
      plate: vehicle.plate,
      color: vehicle.color,
      picture: vehicle.picture,
    });
  });
}

export const updateVehicleItem = (vehicle) => {
  var item = getVehicle(vehicle.id);
  realm.write(() => {
    try {
      item.username = vehicle.username;
      item.make = vehicle.make;
      item.model = vehicle.model;
      item.plate = vehicle.plate;
      item.color = vehicle.color;
      item.picture = vehicle.picture;
    } catch (e) {
      console.log(e);
    }
  })
}

export const deleteVehicleItem = (id) => {
  var item = getVehicle(id);
  realm.write(() => {
    realm.delete(item);
  });
}

export const getVehicle = (vehicle_id) => {
  const item = realm.objectForPrimaryKey(VehicleItem, vehicle_id);
  return item;
}

export const getVehicles = () => {
  return VehicleItem.get();
}

/**
 * SpotItem
 */
class SpotItem {
  static schema = {
    name: 'SpotItem',
    primaryKey: 'id',
    properties: {
      id: {
        type: 'int'
      },
      username: {
        type: 'string'
      },
      position: {
        type: 'string',
      },
      name: {
        type: 'string'
      },
      location: {
        type: 'string'
      },
      type: {
        type: 'int'
      },
      description: {
        type: 'string'
      },
      image: {
        type: 'string'
      },
      availability: {
        type: 'string'
      },
      from: {
        type: 'string'
      },
      to: {
        type: 'string'
      },
      startDate: {
        type: 'string'
      },
      endDate: {
        type: 'string'
      },
      rate: {
        type: 'float'
      },
      phone: {
        type: 'string'
      },
      email: {
        type: 'string'
      }
    }
  }
  static get() {
    return realm.objects('SpotItem');
  }
}

export const createSpotItem = (spot) => {
  if (getSpot(spot.id) !== undefined) 
    return;
  realm.write(() => {
    realm.create(SpotItem.schema.name, {
      id: spot.id,
      username: spot.username,
      position: JSON.stringify(spot.position),
      name: spot.name,
      location: spot.location,
      type: spot.type,
      description: spot.description,
      image: spot.image,
      availability: JSON.stringify(spot.availability),
      from: spot.from,
      to: spot.to,
      startDate: spot.startDate,
      endDate: spot.endDate,
      rate: spot.rate,
      phone: spot.phone,
      email: spot.email,
    });
  });
}

export const updateSpotItem = (spot) => {
  var item = getSpot(spot.id);
  realm.write(() => {
    try {
      item.position = JSON.stringify(spot.position),
      item.name = spot.name;
      item.location = spot.location;
      item.type = spot.type;
      item.description = spot.description;
      item.image = spot.image;
      item.availability = JSON.stringify(spot.availability);
      item.from = spot.from;
      item.to = spot.to;
      item.rate = spot.rate;
      item.phone = spot.phone;
      item.email = spot.email;
    } catch (e) {
      console.log(e);
    }
  });
}

export const deleteSpotItem = (id) => {
  var item = getSpot(id);
  realm.write(() => {
    realm.delete(item);
  });
}

export const getSpot = (spot_id) => {
  const item = realm.objectForPrimaryKey(SpotItem, spot_id);
  return item;
}

export const getSpots = () => {
  return SpotItem
    .get()
    .map(spot => {
      let {position, availability, ...res} = spot;
      res.position = JSON.parse(position);
      res.availability = JSON.parse(availability);
      return res;
    })
}

export const getSpotsOfOthers = (username) => {
  return SpotItem
    .get()
    .filtered('username!="' + username + '"')
    .map(spot => {
      let {position, availability, ...res} = spot;
      res.position = JSON.parse(position)
      res.availability = JSON.parse(availability)
      return res
    })
}

export const getSpotsByUsername = (username) => {
  return SpotItem
    .get()
    .filtered('username="' + username + '"')
    .map(spot => {
      let {position, availability, ...res} = spot;
      res.position = JSON.parse(position)
      res.availability = JSON.parse(availability)
      return res
    })
}

export const getSpotById = (id) => {
  const item = realm.objectForPrimaryKey(SpotItem, id);
  return item
}

export const removeAll = () => {
  realm.write(() => {
    realm.deleteAll();
  });
}

// Create Realm DB
export const realm = new Realm({
  schema: [
    VehicleItem,
    SpotItem
  ]
})