//import liraries
import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import images from '../utils/images';

// create a component
class QuickSearchButton extends Component {
  render() {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={this.props.onPress}
      >
        <Image
          source={images.quickSearchButton}
          style={styles.image}
          resizeMode='stretch'
        />
      </TouchableOpacity>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    position: 'absolute',
    bottom: 30,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  }
});

//make this component available to the app
export default QuickSearchButton;
