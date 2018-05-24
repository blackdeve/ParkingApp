//import liraries
import React, { Component } from 'react';
import PropTypes from "prop-types"
import { Animated, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import images from '../utils/images'
import { width, height } from 'react-native-dimension'

// create a component
class Dropdown extends Component {

  static defaultProps = {
    width: 100,
    height: 30,
    fontSize: 14,
    fontColor: 'black',
    showDropdown: false
  }

  constructor(props) {
    super(props)

    this.state = {
      width: props.width === undefined ? defaultProps.width : props.width,
      height: props.height === undefined ? defaultProps.height : props.height,
      fontSize: props.fontSize === undefined ? defaultProps.fontSize : props.fontSize,
      fontColor: props.fontColor === undefined ? defaultProps.fontColor : props.fontColor,
      listData: props.data === undefined ? [] : props.data,
      value: props.value,
      _x: 0,
      _y: 0
    }
  }

  openDropdown() {
    // this.setState({showDropdown: true})
  }

  render() {

    const {fontSize, fontColor, listData, value, showDropdown} = this.state;
    const _width = this.state.width;
    const _height = this.state.height;

    return (
      <View
        zIndex={this.state.showDropdown ? 2 : 1}
        style={{width: _width, height: _height}}
        ref="Marker"
        onLayout={({nativeEvent}) => {
          this.refs.Marker.measure((x, y, width, height, pageX, pageY) => {
            this.setState({_x: -pageX, _y: -pageY})
          })
        }}
      >
        {
          this.state.showDropdown ?
            <TouchableOpacity
              style={{position: 'absolute', width: width(100), height: height(100), top: this.state._y, left: this.state._x, backgroundColor: 'red'}}
              onPress={()=>{this.setState({showDropdown: false})}}
            />
            : null
        }
        <TouchableOpacity
          style={{flex: 1, flexDirection: 'row'}}
          onPress={()=>{this.openDropdown()}}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#aaa'
          }}>
            <Text style={{color: fontColor, fontSize: fontSize}}>{value}</Text>
          </View>
          <View style={{
            aspectRatio: 1,
            height: '100%',
            borderWidth: 1,
            borderLeftWidth: 0,
            borderColor: '#aaa',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Image
              source={images.downArrow}
              style={{width: '85%', height: '85%'}}
              resizeMode='stretch'
            />
          </View>
        </TouchableOpacity>
        {
          showDropdown ? 
          <ScrollView style={{
            position: 'absolute',
            top: -Math.min(_height * listData.indexOf(value), 200-_height),
            width: _width,
            height: Math.min(_height * listData.length, 200),
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#aaa'
          }}>
            {
              listData.map((data, index) => {
                return (
                  <View
                    key={index}
                    style={{width: _width, height: _height, paddingRight: _height, justifyContent: 'center', alignItems: 'center'}}
                  >
                    <Text style={{color: fontColor, fontSize: fontSize}}>{data}</Text>
                  </View>
                )
              })
            }
          </ScrollView>
          : null
        }
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
});

//make this component available to the app
export default Dropdown;
