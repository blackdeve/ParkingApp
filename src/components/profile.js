//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  ScrollView,
  BackHandler,
  AsyncStorage
} from 'react-native';
import { width, height } from 'react-native-dimension';
import images from '../utils/images';
import CheckBox from 'react-native-checkbox';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import SendBird from 'sendbird';
import apiConfig from '../api/config';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

var sb = null;

const trimStr = str => {
  return str.replace(/^\s+|\s+$/g, '');
}

// create a component
class ProfileScreen extends Component {
  constructor(props) {
    super(props);

    sb = SendBird.getInstance();
    const {user} = props;
    this.state = {
      photo: {uri: apiConfig.url + user.photo},
      photoChanged: false,
      firstName: user.firstname,
      firstNameFocus: false,
      lastName: user.lastname,
      lastNameFocus: false,
      email: user.email,
      emailFocus: false,
      username: user.username,
      usernameFocus: false,
      phone: user.phone,
      phoneFocus: false,
      password: user.password,
      passwordFocus: false,
    }
  }
  
  componentDidMount() {
    const { navigation } = this.props
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.goBack()
      return true
    });
  }

  onSelectPhoto() {
    ImagePicker.showImagePicker({}, (response)  => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        ImageResizer.createResizedImage(response.uri, 200, 200, 'PNG', 100).then((res) => {
          let source = { uri: res.uri, type: 'image/jpg', name: res.name };
          this.setState({
            photo: source,
            photoChanged: true
          });
        }).catch((err) => {
          alert(err)
        })
      }
    });
  }

  update() {
    let {firstName, lastName, email, username, password, phone, photo, photoChanged} = this.state;
    firstName = trimStr(firstName)
    lastName = trimStr(lastName)
    if (photo === null) {
      alert('Please select photo');
      return;
    }
    if (firstName === '') {
      alert('First name cannot be empty')
      return;
    }
    if (lastName === '') {
      alert('Last name cannot be empty')
      return;
    }
    if (email === '') {
      alert('Email cannot be empty')
      return;
    }
    if (username === '') {
      alert('Username cannot be empty')
      return;
    }
    if (password === '') {
      alert('Password cannot be empty')
      return;
    }
    if (phone === '') {
      alert('Phone number cannot be empty')
      return;
    }
    const {user} = this.props;
    if (photoChanged) {
      this.props.update(user.id, firstName, lastName, email, photo, phone, username, password)
      .then((newUser) => {
        this.updateUser(newUser)
      }, (err) => {
        alert(err)
      });
    } else {
      this.props.updateWithoutPhoto(user.id, firstName, lastName, email, phone, username, password)
      .then((newUser) => {
        this.updateUser(newUser)
      }, (err) => {
        alert(err)
      });
    }
  }

  updateUser(user) {
    const {setUser} = this.props
    const name = user.firstname + ' ' + user.lastname;
    sb.updateCurrentUserInfo(name, apiConfig.url + user.photo, function(response, error) {
      AsyncStorage.setItem('user', JSON.stringify(user))
      setUser(user);
    });
  }

  _renderPage() {
    const {
      firstName, firstNameFocus,
      lastName, lastNameFocus,
      email, emailFocus,
      username, usernameFocus,
      password, passwordFocus,
      phone, phoneFocus,
      photo
    } = this.state;
    return (
        <View style={[styles.registerForm, {marginBottom: passwordFocus ? 100 : 0}]}>
          <Text style={styles.registerText}>My Profile</Text>
          <Image
            source={photo}
            style={styles.photo}
            resizeMode='stretch'
          />
          <TouchableOpacity
            style={styles.photoUpload}
            onPress={()=>{this.onSelectPhoto()}}
          >
            <Image
              source={this.state.photo === null ? images.photoUpload : null}
              style={{width: 80, height: 80}}
              resizeMode='stretch'
            />
          </TouchableOpacity>
          
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text
                style={firstName.length == 0
                ? styles.registerInvisible
                : styles.registerVisible}>First Name</Text>
              <View
                style={[
                styles.registerInputContainer, firstNameFocus
                  ? styles.focusUnderline
                  : styles.normalUnderline,
                {marginRight: 0}
              ]}>
                <TextInput
                  style={[styles.textInput, {marginLeft: 0}]}
                  placeholder="First name"
                  placeholderTextColor='#aaa'
                  underlineColorAndroid='transparent'
                  value={firstName}
                  onChangeText={(e)=>{this.setState({firstName: e})}}
                  onFocus={()=>{this.setState({firstNameFocus: true})}}
                  onBlur={()=>{this.setState({firstNameFocus: false})}}
                  autoCorrect={false}/>
              </View>
            </View>
            <View style={{flex: 1, marginLeft: 20}}>
              <Text
                style={[lastName.length == 0
                ? styles.registerInvisible
                : styles.registerVisible, {marginLeft: 0}]}>Last name</Text>
              <View
                style={[
                styles.registerInputContainer, lastNameFocus
                  ? styles.focusUnderline
                  : styles.normalUnderline,
                {marginLeft: 0}
              ]}>
                <TextInput
                  style={[styles.textInput, {marginLeft: 0}]}
                  placeholder="Last name"
                  placeholderTextColor='#aaa'
                  underlineColorAndroid='transparent'
                  value={lastName}
                  onChangeText={(e)=>{this.setState({lastName: e})}}
                  onFocus={()=>{this.setState({lastNameFocus: true})}}
                  onBlur={()=>{this.setState({lastNameFocus: false})}}
                  autoCorrect={false}/>
              </View>
            </View>
          </View>

          <Text
            style={email.length == 0
            ? styles.registerInvisible
            : styles.registerVisible}>Email</Text>
          <View
            style={[
            styles.registerInputContainer, emailFocus
              ? styles.focusUnderline
              : styles.normalUnderline
          ]}>
            <Image source={images.loginEmailIcon} style={styles.icon}/>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor='#aaa'
              underlineColorAndroid='transparent'
              value={email}
              onChangeText={(e)=>{this.setState({email: trimStr(e)})}}
              onFocus={()=>{this.setState({emailFocus: true})}}
              onBlur={()=>{this.setState({emailFocus: false})}}
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='email-address'/>
          </View>

          <Text
            style={username.length == 0
            ? styles.registerInvisible
            : styles.registerVisible}>Username</Text>
          <View
            style={[
            styles.registerInputContainer, usernameFocus
              ? styles.focusUnderline
              : styles.normalUnderline
          ]}>
            <Image source={images.loginUserIcon} style={styles.icon}/>
            <TextInput
              style={styles.textInput}
              placeholder="Username"
              placeholderTextColor='#aaa'
              underlineColorAndroid='transparent'
              value={username}
              onChangeText={(e)=>{this.setState({username: trimStr(e)})}}
              onFocus={()=>{this.setState({usernameFocus: true})}}
              onBlur={()=>{this.setState({usernameFocus: false})}}
              autoCapitalize='none'
              autoCorrect={false}/>
          </View>

          <Text
            style={phone.length == 0
            ? styles.registerInvisible
            : styles.registerVisible}>Phone Number</Text>
          <View
            style={[
            styles.registerInputContainer, phoneFocus
              ? styles.focusUnderline
              : styles.normalUnderline
          ]}>
            <Image source={images.registerPhoneIcon} style={styles.icon}/>
            <TextInput
              style={styles.textInput}
              placeholder="Phone Number"
              placeholderTextColor='#aaa'
              underlineColorAndroid='transparent'
              value={phone}
              onChangeText={(e)=>{this.setState({phone: e})}}
              onFocus={()=>{this.setState({phoneFocus: true})}}
              onBlur={()=>{this.setState({phoneFocus: false})}}
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='phone-pad'/>
          </View>

          <Text
            style={password.length == 0
            ? styles.registerInvisible
            : styles.registerVisible}>Password</Text>
          <View
            style={[
            styles.registerInputContainer, passwordFocus
              ? styles.focusUnderline
              : styles.normalUnderline
          ]}>
            <Image source={images.loginPasswordIcon} style={styles.icon}/>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor='#aaa'
              underlineColorAndroid='transparent'
              value={password}
              onChangeText={(e)=>{this.setState({password: e})}}
              onFocus={()=>{this.setState({passwordFocus: true})}}
              onBlur={()=>{this.setState({passwordFocus: false})}}
              secureTextEntry/>
          </View>

          <View style={{flexDirection: 'row', marginTop: 25, marginBottom: 25, marginLeft: 50, marginRight: 50, height: 40}}>
            <TouchableOpacity style={styles.loginButton} onPress={this.update.bind(this)}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <View style={{width: 30}}/>
            <TouchableOpacity style={[styles.loginButton, {backgroundColor: '#e74c3c'}]} onPress={() => {this.props.navigation.goBack()}}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
    )
  }

  render() {
    return (
      <ScrollView scrollEnabled={false} style={styles.container}>
        <ImageBackground
          source={images.loginBackground}
          style={styles.background}
          resizeMode={'stretch'}>
          { this._renderPage() }
        </ImageBackground>
      </ScrollView>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    width: width(100),
    height: height(100),
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    marginLeft: 10
  },
  textInput: {
    color: '#555',
    padding: 0,
    marginLeft: 10,
    flex: 1
  },
  focusUnderline: {
    borderBottomColor: '#2ecc71',
    borderBottomWidth: Platform.select({ios: 0.8, android: 1.1})
  },
  normalUnderline: {
    borderBottomColor: '#95a5a6',
    borderBottomWidth: Platform.select({ios: 0.5, android: 0.8})
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#33af0c',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  registerForm: {
    width: width(87),
    backgroundColor: 'white',
    borderRadius: 7,
    paddingTop: 25
  },
  registerText: {
    fontSize: 25,
    color: '#000',
    marginTop: 35,
    marginBottom: 25,
    textAlign: 'center'
  },
  photo: {
    position: 'absolute',
    left: 20,
    top: 30,
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#ddd'
  },
  photoUpload: {
    position: 'absolute',
    left: 20,
    top: 30,
    width: 80,
    height: 80
  },
  registerInputContainer: {
    marginLeft: 20,
    marginRight: 20,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#789'
  },
  registerVisible: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 20,
    marginTop: 10
  },
  registerInvisible: {
    fontSize: 14,
    color: 'transparent',
    marginLeft: 20,
    marginTop: 10
  },
  loginButtonView: {
    height: 20,
  },
  signupButton: {
    marginTop: 25,
    marginLeft: 20,
    marginRight: 20,
    height: 40,
    backgroundColor: '#33af0c',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  registerLabel: {
    fontSize: 20,
    color: '#0091f8'
  },
});

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);