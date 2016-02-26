/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React, {
  AppRegistry,
  Component,
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AScrollView from 'react-native-yyscrollview';

var API_KEY = '7waqfqbprs7pajbz28mqf6vz';
var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
var PAGE_SIZE = 10;
var PARAMS = '?apikey=' + API_KEY + '&page_limit=' + PAGE_SIZE;
var REQUEST_URL = API_URL + PARAMS;

class AwesomeProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false,
    };
    this._list = [];
    this._page = 1;
  }

  componentDidMount() {
    this.refresh();
  }

  fetchData(url, isRefresh, finishCallback) {
      fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
            let newlist;
            if (isRefresh) {
                newlist = responseData.movies;
            } else {
                newlist = this._list.slice().concat(responseData.movies);
            }
            this._list = newlist;
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(newlist),
            loaded: true,
          });
          finishCallback && finishCallback();
          if (this._page >= 3) {
              this.refs["scrollView"].setIsAllLoaded(true);
          }
        })
        .catch((error)=>{
            console.log("error: ", error);
            finishCallback && finishCallback();
        })
        .done();
  }

  refresh(finishCallback) {
      let url = REQUEST_URL;
      this._page = 1;
      this.fetchData(url, true, finishCallback);
  }

  loadmore(finishCallback, page) {
      let url = REQUEST_URL + "&page=" + page;
      this.fetchData(url, false, finishCallback);
  }

  render() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <AScrollView
          ref="scrollView"
          dataSource={this.state.dataSource}
        renderRow={this.renderMovie}
        style={styles.listView}
        isListView={true}
        enableLoadmore={true}
        onRefresh={(endRefresh)=>{this.refresh(endRefresh);}}
        onLoadmore={(endRefresh)=>{this.loadmore(endRefresh, ++this._page);}}
        emptyText="No Movies!"
      />
    );
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text>
          Loading movies...
        </Text>
      </View>
    );
  }

  renderMovie(movie) {
    return (
      <View style={styles.container}>
        <Image
          source={{uri: movie.posters.thumbnail}}
          style={styles.thumbnail}
        />
        <View style={styles.rightContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.year}</Text>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
AppRegistry.registerComponent('YYScrollView', () => AwesomeProject);
