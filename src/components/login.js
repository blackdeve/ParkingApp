//import liraries
import React, {Component} from 'react';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Platform,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  AsyncStorage,
  BackHandler
} from 'react-native';
import { width, height } from 'react-native-dimension';
import images from '../utils/images';
import CheckBox from 'react-native-checkbox';
import Modal from 'react-native-modal'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import * as RealmDB from '../redux/realm'
import SendBird from 'sendbird';
import { APP_ID } from '../utils/consts';

var sb = null;

const trimStr = str => {
  return str.replace(/^\s+|\s+$/g, '');
}

const isValidEmail = (email) => {  
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true
  }
  return false
} 

// create a component
class LoginScreen extends Component {

  constructor() {
    super();

    this.state = {
      showLogin: true,
      // Login states
      // username: Platform.select({ios: 'name', android: 'name2'}),
      username: '',
      usernameFocus: false,
      // password: Platform.select({ios: 'name', android: 'name2'}),
      password: '',
      passwordFocus: false,
      // Signup states
      photo: null,
      firstName: '',
      firstNameFocus: false,
      lastName: '',
      lastNameFocus: false,
      email: '',
      emailFocus: false,
      newusername: '',
      newusernameFocus: false,
      phone: '',
      phoneFocus: false,
      newpassword: '',
      newpasswordFocus: false,
      agree: false,
      showAgreement: false,
      keyboardOffset: 0,
    }

    this.handleKeyboardShow = this.handleKeyboardShow.bind(this);
    this.handleKeyboardHide = this.handleKeyboardHide.bind(this);

    RealmDB.removeAll();
  }

  componentDidMount() {
    const { navigation } = this.props
    BackHandler.addEventListener('hardwareBackPress', function() {
      return true
    });

    sb = new SendBird({appId: APP_ID});

    AsyncStorage.getItem('user', (err, res) => {
      if (res === null) {
        Keyboard.addListener('keyboardDidShow', this.handleKeyboardShow);
        Keyboard.addListener('keyboardDidHide', this.handleKeyboardHide);
        Keyboard.addListener('keyboardWillShow', this.handleKeyboardShow);
        Keyboard.addListener('keyboardWillHide', this.handleKeyboardHide);
        return
      }
      const user = JSON.parse(res)
      const { setUser, loadData } = this.props;
      sb.connect(user.username, function(sbuser, error) {
        setUser(user);
        loadData(user.username)
      });
    })
  }

  _initScreen() {
    this.setState({
      showLogin: true,
      username: '',
      password: '',
      photo: null,
      firstName: '',
      lastName: '',
      email: '',
      newusername: '',
      newpassword: '',
      phone: '',
      agree: false,
    })
  }

  handleKeyboardShow(e) {
    let offset = Platform.select({ios: 0, android: 25});
    this.setState({keyboardOffset: e.endCoordinates.height + offset});
  }
  
  handleKeyboardHide() {
    this.setState({keyboardOffset: 0});
  }

  onUsernameChange(e) {
    this.setState({username: e});
  }

  onUsernameFocus(e) {
    if (this.state.usernameFocus) 
      return;
    this.setState({usernameFocus: true, passwordFocus: false});
  }

  onPasswordChange(e) {
    this.setState({password: e});
  }

  onPasswordFocus(e) {
    if (this.state.passwordFocus)
      return;
    this.setState({passwordFocus: true, usernameFocus: false});
  }

  login() {
    Keyboard.removeListener('keyboardDidShow', this.handleKeyboardShow);
    Keyboard.removeListener('keyboardDidHide', this.handleKeyboardHide);
    Keyboard.removeListener('keyboardWillShow', this.handleKeyboardShow);
    Keyboard.removeListener('keyboardWillHide', this.handleKeyboardHide);
    
    let { username, password } = this.state;
    const { login, setUser } = this.props;
    login(username, password)
      .then((user) => {
        console.log('Login success!')
        // Connect to Sendbird
        sb.connect(user.username, function(sbuser, error) {
          AsyncStorage.setItem('user', JSON.stringify(user))
          setUser(user);
        });
      }, (err) => {
        alert(err)
      });
  }

  register() {
    let {firstName, lastName, email, newusername, newpassword, phone, agree, photo} = this.state;
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
    if (!isValidEmail(email)) {
      alert('Email is not valid')
      return
    }
    if (newusername === '') {
      alert('Username cannot be empty')
      return;
    }
    if (newpassword === '') {
      alert('Password cannot be empty')
      return;
    }
    if (phone === '') {
      alert('Phone number cannot be empty')
      return;
    }
    var PhoneNumber = require( 'awesome-phonenumber' )
    var pn = new PhoneNumber( phone );
    if (!pn.isValid()) {
      alert('Please input valid phone number')
      return
    }
    if (!agree) {
      alert('Please read and check the agreement');
      return;
    }
    this.props.register(firstName, lastName, email, photo, phone, newusername, newpassword)
      .then(() => {
        alert('Register success!')
        this._initScreen()
      }, (err) => {
        alert(err)
      });
  }

  _renderLoginPage() {
    const {username, password, usernameFocus, passwordFocus, keyboardOffset} = this.state;
    return (
      <View style={{paddingBottom: keyboardOffset}}>
        <View style={styles.loginForm}>
          <Text style={styles.loginText}>Login</Text>

          <Text
            style={username.length == 0
            ? styles.invisible
            : styles.visible}>Username</Text>
          <View
            style={[
            styles.inputContainer, usernameFocus
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
              onChangeText={ this.onUsernameChange.bind(this) }
              onFocus={ this.onUsernameFocus.bind(this) }
              autoCapitalize='none'
              autoCorrect={false}/>
          </View>

          <Text
            style={password.length == 0
            ? styles.invisible
            : styles.visible}>Password</Text>
          <View
            style={[
            styles.inputContainer, passwordFocus
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
              onChangeText={ this.onPasswordChange.bind(this) }
              onFocus={ this.onPasswordFocus.bind(this) }
              secureTextEntry/>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={this.login.bind(this)}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.registerButtonView}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={()=>{
                this.setState({
                  showLogin: false,
                  username: '',
                  usernameFocus: false,
                  password: '',
                  passwordFocus: false
                })
              }}
            >
              <Text style={styles.registerButtonText}>New User?</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    )
  }

  _renderSignupPage() {
    const {
      firstName, firstNameFocus,
      lastName, lastNameFocus,
      email, emailFocus,
      newusername, newusernameFocus,
      newpassword, newpasswordFocus,
      phone, phoneFocus,
      photo, agree
    } = this.state;
    return (
        <View style={styles.registerForm}>
          <Text style={styles.registerText}>Sign up</Text>
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
            style={newusername.length == 0
            ? styles.registerInvisible
            : styles.registerVisible}>Username</Text>
          <View
            style={[
            styles.registerInputContainer, newusernameFocus
              ? styles.focusUnderline
              : styles.normalUnderline
          ]}>
            <Image source={images.loginUserIcon} style={styles.icon}/>
            <TextInput
              style={styles.textInput}
              placeholder="Username"
              placeholderTextColor='#aaa'
              underlineColorAndroid='transparent'
              value={newusername}
              onChangeText={(e)=>{this.setState({newusername: trimStr(e)})}}
              onFocus={()=>{this.setState({newusernameFocus: true})}}
              onBlur={()=>{this.setState({newusernameFocus: false})}}
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
            style={newpassword.length == 0
            ? styles.registerInvisible
            : styles.registerVisible}>Password</Text>
          <View
            style={[
            styles.registerInputContainer, newpasswordFocus
              ? styles.focusUnderline
              : styles.normalUnderline
          ]}>
            <Image source={images.loginPasswordIcon} style={styles.icon}/>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor='#aaa'
              underlineColorAndroid='transparent'
              value={newpassword}
              onChangeText={(e)=>{this.setState({newpassword: e})}}
              onFocus={()=>{this.setState({newpasswordFocus: true})}}
              onBlur={()=>{this.setState({newpasswordFocus: false})}}
              secureTextEntry/>
          </View>

          <View style={{flexDirection: 'row', marginTop: 20, alignItems: 'center', justifyContent: 'center'}}>
            <View style={{width: 15, height: 15, paddingTop: 1}}>
              <CheckBox
                label=''
                checkboxStyle={{width: 15, height: 15, borderColor: '#ddd'}}
                checked={agree}
                onChange={(checked) => {this.setState({agree: !agree})}}
              />
            </View>
            <TouchableOpacity
              style={{marginLeft: 10}}
              onPress={()=>{this.setState({showAgreement: true})}}
            >
              <Text style={styles.registerLabel}>Agreement</Text>
            </TouchableOpacity>
          </View>


          <TouchableOpacity style={styles.loginButton} onPress={this.register.bind(this)}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

          <View style={styles.loginButtonView}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={()=>{
                this.setState({
                  showLogin: true,
                  firstName: '',
                  lastName: '',
                  photo: null,
                  phone: '',
                  newusername: '',
                  newpassword: '',
                  agree: false,
                })
              }}
            >
              <Text style={styles.registerButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          </View>
        </View>
    )
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
            photo: source
          });
        }).catch((err) => {
          alert(err)
        })
      }
    });
  }

  onCloseAgreement() {
    this.setState({showAgreement: false})
  }

  render() {
    return (
      <ScrollView scrollEnabled={false} style={styles.container}>
        <ImageBackground
          source={images.loginBackground}
          style={styles.background}
          resizeMode={'stretch'}>
          {
            this.state.showLogin ?
            this._renderLoginPage()
            : this._renderSignupPage()
          }
          <Modal
            isVisible={this.state.showAgreement}
            onBackButtonPress={this.onCloseAgreement.bind(this)}
            onBackdropPress={this.onCloseAgreement.bind(this)}
          >
            <View style={{
              width: width(85),
              height: height(75),
              backgroundColor: 'white',
              borderRadius: 7,
              alignSelf: 'center'
            }}>
              <Text style={styles.agreementTitle}>Agreement</Text>
              <View style={styles.agreementView}>
                <Text style={styles.agreementText}>This is test agreement</Text>
              </View>
            </View>
          </Modal>
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
  loginForm: {
    width: width(87),
    height: 340,
    borderRadius: 7,
    backgroundColor: '#fff'
  },
  keyboardStyle: {
    width: width(87),
    height: 335,
    borderRadius: 7,
    backgroundColor: '#fff',
    marginBottom: 30
  },
  loginText: {
    fontSize: 25,
    color: '#000',
    marginTop: 20,
    textAlign: 'center'
  },
  visible: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 20,
    marginTop: 20
  },
  invisible: {
    fontSize: 14,
    color: 'transparent',
    marginLeft: 20,
    marginTop: 20
  },
  inputContainer: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center'
    // backgroundColor: '#789'
  },
  icon: {
    marginLeft: 10,
  },
  textInput: {
    color: '#555',
    padding: 0,
    marginLeft: 10,
    flex: 1,
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
    marginTop: 25,
    marginLeft: 40,
    marginRight: 40,
    height: 40,
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
  registerButtonView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  registerButton: {
    padding: 3,
  },
  registerButtonText: {
    fontSize: 16,
    color: '#0091f8'
  },
  registerForm: {
    width: width(87),
    backgroundColor: 'white',
    borderRadius: 7,
    paddingTop: 25,
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
    borderRadius : 37.5,
    backgroundColor : '#ddd'
  },
  photoUpload: {
    position: 'absolute',
    left: 20,
    top: 30,
    width: 80,
    height: 80,
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
    marginTop: 10,
  },
  registerInvisible: {
    fontSize: 14,
    color: 'transparent',
    marginLeft: 20,
    marginTop: 10,
  },
  loginButtonView: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
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
  agreementTitle: {
    marginTop: 30,
    marginBottom: 20,
    color: '#0091f8',
    fontSize: 24,
    textAlign: 'center'
  },
  agreementView: {
    flex: 1,
    margin: 15,
    marginTop: 0,
  },
  agreementText: {
    fontSize: 18,
    color: 'black'
  }
});

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);