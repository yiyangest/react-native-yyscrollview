'use strict';

import React, {
    PropTypes,
    ScrollView,
    ListView,
    View,
    Text,
    StyleSheet,
    Image,
    cloneElement,
} from 'react-native';
import ScrollableMixin from 'react-native-scrollable-mixin';
import YYSpinner from './YYSpinner';

const REFRESH_STATUS = {
    INIT: 0, // 初始状态
    RELEASE_TO_REFRESH: 1, // 松开刷新
    REFRESHING: 2, // 正在刷新
    DONE: 3, // 完成
    RELEASE_TO_LOAD: 4, // 松开加载
    LOADING: 5, // 正在加载
    NONE: 6, // 加载不显示
};

const LIST_STATUS = {
    NORMAL: 'normal',
    EMPTY: 'empty',
    ERROR: 'error',
    ALL_LOAD: 'all_load'
};

class DataScrollView extends React.Component {
    constructor(props) {
        super(props);

        this._footerIsRender = false;
        this.initialLoadmoreOffset = 0;
        this.scrollOffset = 0;
        this.state = {
            refreshStatus: REFRESH_STATUS.NONE,
            isRefreshing: false,
            loadingStatus: REFRESH_STATUS.NONE,
            isAllLoaded: false,
            listStatus: this.props.listStatus
        }
    }

    static defaultProps = {
        isListView: false,
        enableRefresh: true,
        enableLoadmore: false,

        scrollEventThrottle: 100,

        refreshableViewHeight: 50,
        refreshableDistance: 40,
        onRefresh: function(endRefresh) {
            endRefresh();
        },


        loadmoreViewHeight: 50,
        loadmoreDistance: 40,
        onLoadmore: function(endRefresh) {
            endRefresh();
        },

        listStatus: LIST_STATUS.NORMAL,

        emptyText: "您目前没有数据",
        errorText: "开小差啦...",
        renderScrollComponent: props => <ScrollView {...props} />,
    };

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentWillReceiveProps(newProps) {
        if (this.props && this.props.listStatus !== newProps.listStatus) {
            this.setState({listStatus: newProps.listStatus});
        }
    }

    getScrollResponder(): ReactComponent {
        return this._scrollComponent.getScrollResponder();
    }

    setNativeProps(nativeProps) {
        this._scrollComponent.setNativeProps(nativeProps);
    }

    /**
     * 正在刷新的view
     * @returns {*}
     */
    refreshableFetchingView() {
        if (this.props.refreshableFetchingView) {
            return this.props.refreshableFetchingView;
        }
        return (
            <View style={[defaultStyles.refreshableView, {flexDirection: 'row'}, {height: this.props.refreshableViewHeight}]}>
                <YYSpinner />
                <Text style={{marginLeft: 10}}>正在刷新...</Text>
            </View>
        );
    }

    /**
     * 提示松开刷新的view
     * @returns {*}
     */
    refreshableWillRefreshView() {
        if (this.props.refreshableWillRefreshView) {
            return this.props.refreshableWillRefreshView();
        }
        return (
            <View style={[defaultStyles.refreshableView, {height: this.props.refreshableViewHeight}]}>
                <Image source={require("./img/pull_icon_big.png")} style={{transform: [{rotateX: "180deg"}]}}/>
                <Text style={defaultStyles.text}>释放立即刷新...</Text>
            </View>
        );
    }

    /**
     * 下拉刷新的view
     * @returns {*}
     */
    refreshableWaitingView() {
        if (this.props.refreshableWaitingView) {
            return this.props.refreshableWaitingView();
        }
        return (
            <View style={[defaultStyles.refreshableView, {height: this.props.refreshableViewHeight}]}>
                <Image source={require("./img/pull_icon_big.png")}/>
                <Text style={defaultStyles.text}>下拉刷新...</Text>
            </View>
        );
    }

    refreshableFinishView() {
        if (this.props.refreshFinishView) {
            return this.props.refreshFinishView();
        }
        return (
            <View style={[defaultStyles.refreshableView, {height: this.props.refreshableViewHeight}]}>
                <Text>刷新成功!</Text>
            </View>
        );
    }

    loadmoreFetchingView() {
        if (this.props.loadmoreFetchingView) {
            return this.props.loadmoreFetchingView();
        }
        return (
            <View style={[defaultStyles.refreshableView, {height: this.props.loadmoreViewHeight}]}>
                <YYSpinner />
                <Text style={defaultStyles.text}>正在加载...</Text>
            </View>
        );
    }

    loadmoreWillLoadView() {
        if (this.props.loadmoreWillLoadView) {
            return this.props.loadmoreWillLoadView();
        }
        return (
            <View style={[defaultStyles.refreshableView, {height: this.props.loadmoreViewHeight}]}>
                <Image source={require("./img/pull_icon_big.png")} style={{transform: [{rotateX: "180deg"}]}}/>
                <Text style={defaultStyles.text}>释放立即刷新...</Text>
            </View>
        );
    }

    loadmoreWaitingView() {
        if (this.props.loadmoreWaitingView) {
            return this.props.loadmoreWaitingView();
        }
        return (

            <View style={[defaultStyles.refreshableView, {height: this.props.loadmoreViewHeight}]}>
                <Image source={require("./img/pull_icon_big.png")}/>
                <Text style={defaultStyles.text}>上拉加载更多...</Text>
            </View>
        );
    }

    loadmoreFinishView() {
        if (this.props.loadmoreFinishView) {
            return this.props.loadmoreFinishView();
        }
        return (
            <View style={[defaultStyles.refreshableView, {height: this.props.loadmoreViewHeight}]}>
                <Text>加载成功!</Text>
            </View>
        );
    }

    allLoadedView() {
        if (this.props.allLoadedView) {
            return this.props.allLoadedView();
        }
        return (
            <View style={[defaultStyles.refreshableView, {height: this.props.loadmoreViewHeight}]}>
                <Text>已经全部加载完毕</Text>
            </View>
        );
    }

    _renderRefreshView() {
        switch (this.state.refreshStatus) {
            case REFRESH_STATUS.REFRESHING:
                return this.refreshableFetchingView();
                break;
            case REFRESH_STATUS.RELEASE_TO_REFRESH:
                return this.refreshableWillRefreshView();
                break;
            case REFRESH_STATUS.DONE:
                return this.refreshableFinishView();
                break;
            case REFRESH_STATUS.INIT:
                return this.refreshableWaitingView();
            default:
                return (
                    <View style={[defaultStyles.refreshableView, {height: this.props.refreshableViewHeight}]}/>
                );
        }
    }
    _renderLoadmoreView() {
        this._footerIsRender = true;
        switch (this.state.loadingStatus) {
            case REFRESH_STATUS.LOADING:
                return this.loadmoreFetchingView();
                break;
            case REFRESH_STATUS.RELEASE_TO_LOAD:
                return this.loadmoreWillLoadView();
                break;
            case REFRESH_STATUS.INIT:
                return this.loadmoreWaitingView();
                break;
            case REFRESH_STATUS.DONE:
                return this.loadmoreFinishView();
            default:
                //this._footerIsRender = false;
                //return null;
                return (
                    <View style={[defaultStyles.refreshableView, {height: this.props.refreshableViewHeight}]}/>
                );
        }
    }
    _isEmpty() {
        return !this.props.dataSource || this.props.dataSource.getRowCount()<=0;
    }

    _renderEmptyView() {
        if (this.props.renderEmptyView) {
            return this.props.renderEmptyView();
        }
        let emptyIcon;
        if (this.props.emptyIcon) {
            emptyIcon = (
                <Image style={defaultStyles.emptyIcon} source={this.props.emptyIcon}/>
            );
        }

        return (
            <View style={defaultStyles.emptyView}>
                {emptyIcon}
                <Text style={defaultStyles.emptyText}>{this.props.emptyText}</Text>
            </View>
        );
    }

    _renderErrorView() {
        if (this.props.renderErrorView) {
            return this.props.renderErrorView();
        }
        let errorIcon;
        if (this.props.errorIcon) {
            errorIcon = (
                <Image style={defaultStyles.emptyIcon} source={this.props.errorIcon} />
            );
        }

        return (
            <View style={defaultStyles.emptyView}>
                {emptyIcon}
                <Text style={defaultStyles.emptyText}>{this.props.errorText}</Text>
            </View>
        );
    }

    _renderHeaderView() {
        if (this.props.renderHeader) {
            return (
                <View>
                    {this._renderRefreshView()}
                    {this.props.renderHeader()}
                </View>
            );
        }
        return this._renderRefreshView();
    }
    _renderFooterView() {
        let footerView = null;
        if (this.state.listStatus === LIST_STATUS.ERROR) {
            return this._renderErrorView();
        } else if (this.state.listStatus === LIST_STATUS.EMPTY) {
            return this._renderEmptyView();
        } else if (this.state.listStatus === LIST_STATUS.ALL_LOAD) {
            footerView = this.allLoadedView();
        } else {
            if (this.props.enableLoadmore) {
                footerView = this._renderLoadmoreView();
            }
        }
        if (this.props.renderFooter) {
            return (
                <View>
                    {footerView}
                    {this.props.renderFooter()}
                </View>
            );
        }

        return footerView;
    }

    render() {
        if (this.props.isListView) {
            return this.renderListView();
        }
        return (
            <ScrollView scrollEventThrottle={200}
                        ref={(component)=>this._scrollComponent=component}
                        automaticallyAdjustContentInsets={false}
                        onScroll={this._onScroll.bind(this)}
                        style={this.props.style}
                        contentContainerStyle={[{top: -this.props.refreshableViewHeight}]}
                        onResponderRelease={this._onResponderRelease.bind(this)}>
                <View>
                    {this._renderRefreshView()}
                    {this.props.children}
                </View>
            </ScrollView>
        );
    }
    renderListView() {
        return(
            <ListView ref={(component)=>this._scrollComponent=component}
                      automaticallyAdjustContentInsets={false}
                      onResponderRelease={this._onResponderRelease.bind(this)}
                      onResponderGrant={this._onResponderGrant.bind(this)}
                      onScroll={this._onScroll.bind(this)}

                      dataSource={this.props.dataSource}
                      renderRow={this.props.renderRow}
                      renderHeader={this._renderHeaderView.bind(this)}
                      renderFooter={this._renderFooterView.bind(this)}

                {...this.props}
                      contentContainerStyle={[{top: -this.props.refreshableViewHeight}]}
            />
        );
    }
    isMounted() {
        return this._isMounted;
    }

    setIsAllLoaded(isAllLoaded) {
        if (this.props.enableLoadmore) {
            this.isMounted &&
            this.setState({
                isAllLoaded: isAllLoaded
            });
        }
    }

    autoRefresh() {
        this._onRefresh();
    }
    _onRefresh() {
        if (this.isMounted()) {
            this.scrollTo({y:-this.props.refreshableViewHeight, animated: true});
            this.setState({
                refreshStatus: REFRESH_STATUS.REFRESHING,
                isRefreshing: true,
                isAllLoaded: false,
            });
            this.props.onRefresh(this._endRefresh.bind(this));
        }
    }

    _endRefresh() {
        if (this.isMounted()) {
            this.setState({
                refreshStatus: REFRESH_STATUS.DONE,
                isRefreshing: false
            });
            setTimeout(()=>{
                this.setState({refreshStatus: REFRESH_STATUS.NONE});
            }, 1000);
            // this.scrollTo(this.props.refreshableViewHeight);
            this.scrollTo({y:0});
        }
    }

    _onLoadmore() {
        this.isMounted() &&
        this.setState({
            loadingStatus: REFRESH_STATUS.LOADING
        });
        this.props.onLoadmore(this._endLoadmore.bind(this));
    }

    _endLoadmore() {
        this.isMounted() &&
        this.setState({
            loadingStatus: REFRESH_STATUS.NONE
        });
    }
    _onResponderGrant(e) {
        if (this.props.enableLoadmore && this.state.loadingStatus == REFRESH_STATUS.NONE && !!e.nativeEvent.contentInset) {
            let offsetY = e.nativeEvent.contentInset.top + e.nativeEvent.contentOffset.y;
            if (offsetY < 0) {
                this.setState({refreshStatus: REFRESH_STATUS.INIT});
            } else {
                offsetY = this._distanceFromEnd(e);
                if (offsetY > 0 && !this._isEmpty()) {
                    this.initialLoadmoreOffset = offsetY;
                    this.setState({loadingStatus: REFRESH_STATUS.INIT});
                }
            }
        }
    }

    _onResponderRelease() {
        if (this.state.refreshStatus == REFRESH_STATUS.RELEASE_TO_REFRESH) {
            this._onRefresh();
        } else if (this.state.loadingStatus == REFRESH_STATUS.RELEASE_TO_LOAD && this.props.enableLoadmore) {
            this._onLoadmore();
        } else if (this.state.loadingStatus == REFRESH_STATUS.INIT || this.state.loadingStatus == REFRESH_STATUS.DONE) {
            this.setState({loadingStatus: REFRESH_STATUS.NONE});
        } else if (this.state.refreshStatus == REFRESH_STATUS.INIT || this.state.refreshStatus == REFRESH_STATUS.DONE) {
            this.setState({refreshStatus: REFRESH_STATUS.NONE});
        }
    }

    _onScroll(e) {
        // this._setY(e.nativeEvent.contentOffset.y);
        // console.log("=======================");
        // console.log("[scroll] ==> _y: " + this._getY());
        // console.log("[scroll] ==> contentSize: ", e.nativeEvent.contentSize, " contentInset: ", e.nativeEvent.contentInset, " layoutMeasurement: ", e.nativeEvent.layoutMeasurement);
        let topOffset = this._distanceFromTop(e);
        let bottomOffset = this._distanceFromEnd(e);
        // console.log("[scroll] ==> topOffset: " + topOffset);
        // console.log("[scroll] ==> distance from end: ", bottomOffset);

        if (!this.getScrollResponder().scrollResponderHandleScrollShouldSetResponder()) {
            return;
        }

        if (topOffset > 0 && (this.state.loadingStatus === REFRESH_STATUS.NONE)) {
            if (topOffset > this.props.refreshableDistance && this.state.refreshStatus == REFRESH_STATUS.INIT ) {
                this.setState({refreshStatus: REFRESH_STATUS.RELEASE_TO_REFRESH, isRefreshing: false});
            } else if (topOffset <= this.props.refreshableDistance &&
                (this.state.refreshStatus == REFRESH_STATUS.RELEASE_TO_REFRESH ||
                this.state.refreshStatus == REFRESH_STATUS.DONE ||
                this.state.refreshStatus == REFRESH_STATUS.NONE)) {
                this.setState({refreshStatus: REFRESH_STATUS.INIT, isRefreshing: false});
            }
        } else if (topOffset > 0){
            this.setState({refreshStatus: REFRESH_STATUS.NONE});
        } else if (bottomOffset > 0 && this.props.enableLoadmore && (this.state.loadingStatus == REFRESH_STATUS.INIT || this.state.loadingStatus == REFRESH_STATUS.RELEASE_TO_LOAD ||this.state.loadingStatus == REFRESH_STATUS.DONE || this.state.loadingStatus == REFRESH_STATUS.NONE)) {
            if (this._isEmpty() || this.state.isAllLoaded) {
                return;
            }
            if (this.state.loadingStatus == REFRESH_STATUS.NONE) {
                this.initialLoadmoreOffset = bottomOffset;
                this.setState({loadingStatus: REFRESH_STATUS.INIT});
            }
            if (this.state.loadingStatus == REFRESH_STATUS.INIT && (bottomOffset - this.initialLoadmoreOffset) > this.props.loadmoreDistance) {
                this.setState({loadingStatus: REFRESH_STATUS.RELEASE_TO_LOAD});
            }
            if (this.state.loadingStatus == REFRESH_STATUS.RELEASE_TO_LOAD && (bottomOffset - this.initialLoadmoreOffset) <= this.props.loadmoreDistance) {
                this.setState({loadingStatus: REFRESH_STATUS.INIT});
            }
            // console.log("[scroll] ==> initial loadmore offset:  ", this.initialLoadmoreOffset);

        }
    }

    _distanceFromEnd(event) {
        let {
            contentSize,
            contentInset,
            contentOffset,
            layoutMeasurement,
            } = event.nativeEvent;

        var contentLength = contentSize.height;
        var trailingInset = contentInset.bottom;
        var leadingInset = contentInset.top;
        var scrollOffset = contentOffset.y;
        var viewportHeight = layoutMeasurement.height;

        return viewportHeight + scrollOffset - contentLength;
    }
    _distanceFromTop(event) {

        let {
            contentInset,
            contentOffset,
            } = event.nativeEvent;

        var leadingInset = contentInset.top;
        var scrollOffset = contentOffset.y;

        return -1.0 * (scrollOffset + leadingInset);
    }
}

var defaultStyles = StyleSheet.create({
    refreshableView: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    text: {
        marginLeft: 10
    },
    emptyView: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    emptyIcon: {
        marginTop: 100,
        marginBottom: 20
    },
    emptyText: {
        color: 'black',
        opacity: 0.7,
        fontSize: 15
    }
});

Object.assign(DataScrollView.prototype, ScrollableMixin);

export default DataScrollView;
