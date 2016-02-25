/**
 * Created by yiyang on 16/1/7.
 */
'use strict';

import React from 'react-native';
let {
    View,
    ActivityIndicatorIOS,
    ProgressBarAndroid,
    Platform
    } = React;

export default class YYSpinner extends React.Component {
    _getSpinner() {
        if (Platform.OS == 'ios') {

            return(
                <ActivityIndicatorIOS animating={true} size="small" {...this.props}/>
            );
        } else {
            return(
                <ProgressBarAndroid style={{height: 20}} styleAttr="Inverse" {...this.props}/>
            );
        }
    }

    render() {
        return (
            <View>
                {this._getSpinner()}
            </View>
        );
    }
}
