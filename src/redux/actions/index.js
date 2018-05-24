import * as UserActions from './user';
import * as VehicleActions from './vehicle';
import * as SpotActions from './spot';
import * as CarActions from './car';
import * as ReservationActions from './reservation';

export const ActionCreators = Object.assign({},
  UserActions,
  VehicleActions,
  SpotActions,
  CarActions,
  ReservationActions,
);