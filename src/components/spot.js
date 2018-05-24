//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import images from '../utils/images'

// create a component
class SpotScreen extends Component {

  _renderSpotItem(number, detail, payment) {
    return (
      <View style={styles.spotBox}>
        <Text style={styles.spotNo}>Spot# {number}</Text>
        <Text style={styles.spotDetail}>Details: {detail}</Text>
        <Text style={[styles.spotDetail, {alignSelf: 'flex-end'}]}>{payment}</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={images.messageBackground}
          style={{flex:1}}
          resizeMode='stretch'
        >
          <View style={styles.safeArea}>
            {/*-----Navigation Bar-----*/}
            <TouchableOpacity
              style={[styles.navigationButton, styles.buttonLeft]}
              onPress={() => {
                this.props.navigation.goBack();
              }}
            >
              <Image
                source={images.navigationBack}
                style={{width: 20, height: 20}}
                resizeMode='contain'
              />
            </TouchableOpacity>
            <Text style={styles.navigationTitle}>Coppins Well</Text>
            {/*------------------------*/}
            <View style={{
              marginTop: 55,
              marginBottom: 20,
              marginLeft: 25,
              marginRight: 25,
            }}>
              <Image
                source={images.testSpotImage}
                style={{width: '100%', height: 110}}
                resizeMode='stretch'
              />
            </View>
            <View style={{
              flex: 1,
              backgroundColor: '#f6f9fc',
              paddingLeft: 22,
              paddingRight: 22,
            }}>
              <View style={styles.spotInfoContainer}>
                <Text style={styles.spotInfoText} numberOfLines={2}>Description: Optional</Text>
                <Text style={styles.spotInfoText} numberOfLines={2}>Location: 1000 minor ave, Seattle, WA</Text>
                <View style={styles.managerInfoContainer}>
                  <Image
                    source={images.testPhoto2}
                    style={styles.managerPhoto}
                    resizeMode='stretch'
                  />
                  <View style={styles.managerInfo}>
                    <Text style={styles.managerInfoText}>Project Manager</Text>
                    <Text style={styles.managerInfoText}>John Smith</Text>
                  </View>
                  <TouchableOpacity
                    style={{alignSelf: 'flex-end'}}
                  >
                    <Image
                      source={images.messageIcon}
                      style={styles.message}
                      resizeMode='stretch'
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/*-----Spots-----*/}
              <ScrollView
                style={styles.spotScroll}
              >
                { this._renderSpotItem(12, 'P1 left turn', 'Visa') }
                { this._renderSpotItem(34, 'P2 left turn', 'Visa') }
              </ScrollView>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  safeArea: {
    flex: 1,
    marginTop: Platform.select({ios: 20}),
  },
  navigationButton: {
    position: 'absolute',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLeft: {
    marginLeft: 20,
  },
  navigationTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    marginTop: 18,
    alignSelf: 'center'
  },
  spotInfoContainer: {
    justifyContent: 'space-between',
    height: 185,
    paddingLeft: 10,
    paddingRight: 40,
    paddingTop: 15,
    paddingBottom: 25,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ddd'
  },
  spotInfoText: {
    color: '#aaa',
    fontWeight: 'bold',
    fontSize: 15
  },
  managerInfoContainer: {
    flexDirection: 'row',
  },
  managerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  managerInfo: {
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'space-around'
  },
  managerInfoText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
  },
  message: {
    width: 24,
    height: 24,
  },
  spotScroll: {
    flex: 1,
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  spotBox: {
    marginBottom: 20,
    width: '100%',
    height: 80,
    borderRadius: 7,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15
  },
  spotNo: {
    color: 'black',
    fontSize: 17,
  },
  spotDetail: {
    color: '#aaa',
    fontSize: 14,
  }
});

//make this component available to the app
export default SpotScreen;
