import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FlatList, Text, View, Image, Dimensions, ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/Ionicons'
import isNil from 'lodash/isNil'
import { GalleryTile, BackButton } from '../components/'
import {
  styles,
  numOfGalleryTilesPerRow,
  headerPadding,
  bloodOrange,
  transparentDark,
  transparentLight,
} from '../styles'
import * as actions from '../actionTypes'
import pamImage from '../assets/pam.jpg'

const { width, height } = Dimensions.get('window')

class Home extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getGalleryArtwork: PropTypes.func.isRequired,
    getArtworkForGenre: PropTypes.func.isRequired,
    getProfileArtwork: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    hasError: PropTypes.bool,
  }

  static defaultProps = {
    isLoading: false,
    hasError: false,
  }

  static galleryItemKeyExtractor(item) {
    return `art${item.ObjectID}`
  }

  componentDidMount = () => {
    this.fetchArtForRoute()
  }

  componentDidUpdate = (prevProps) => {
    const { params = {} } = this.props.match

    if (params.galleryId !== prevProps.match.params.galleryId) {
      this.fetchArtForRoute()
    }
  }

  getHeaderTitle = () => {
    const {
      data = {},
      match = {},
      isLoading,
      hasError,
    } = this.props

    if (isLoading) { return null }

    if (hasError) { return 'No Artwork Available' }

    return data.name ? data.name : `Recommendations for ${match.params.genreName || 'You'}`
  }

  fetchArtForRoute = () => {
    const { params = {} } = this.props.match

    if (params.galleryId) {
      return this.props.getGalleryArtwork(params.galleryId)
    } else if (params.genreName) {
      return this.props.getArtworkForGenre(params.genreName)
    }

    return this.props.getProfileArtwork()
  }

  goToArtDetail = (id) => {
    this.props.history.push(`/detail/${id}`)
  }

  profileMatchOverlay = item => (
    item.matchesProfile && (
      <Icon
        color={bloodOrange}
        name="md-star"
        size={20}
        style={myStyles.profileMatchOverlay}
      />
    )
  )

  locationOverlay = item =>
    (item.Location && item.Location.GalleryShort) && (
      <View style={myStyles.locationOverlay}>
        <Text style={myStyles.location}>
          {item.Location && item.Location.GalleryShort}
        </Text>
      </View>
    )

  renderHeader = () => {
    const { params = {} } = this.props.match

    return (
      <View style={myStyles.imageContainer}>
        {params.genreName && (
          <BackButton
            onPress={() => this.props.history.goBack()}
            style={myStyles.backButton}
          />
        )}
        <Image
          source={pamImage}
          style={myStyles.headerImage}
        />
        <View style={myStyles.headerTitle}>
          <Text
            adjustsFontSizeToFit
            style={styles.boldWhite}
          >
            {this.getHeaderTitle()}
          </Text>
        </View>
      </View>
    )
  }

  renderGalleryTile = ({ item }) => (
    <GalleryTile
      onPress={() => this.goToArtDetail(item.ObjectID)}
      photoUrl={item.Thumbnail}
      renderOverlay={() => (
        isNil(item.matchesProfile) ?
          this.locationOverlay(item) :
          this.profileMatchOverlay(item)
      )}
    />
  )

  render() {
    return (
      <View style={myStyles.container}>
        <FlatList
          ListHeaderComponent={this.renderHeader}
          ListEmptyComponent={
            this.props.isLoading &&
              <ActivityIndicator style={myStyles.indicator} />
          }
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: headerPadding, // adding some extra padding for the header at the top
          }}
          horizontal={false}
          numColumns={numOfGalleryTilesPerRow}
          columnWrapperStyle={{
            marginTop: 20,
          }}
          data={this.props.data.art}
          keyExtractor={Home.galleryItemKeyExtractor}
          renderItem={this.renderGalleryTile}
        />
      </View>
    )
  }
}

const headerHeight = (height / 5)
const myStyles = {
  container: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    height: height / 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginRight: -10,
  },
  backButton: {
    left: 0,
    top: 0,
  },
  headerImage: {
    width,
    height: headerHeight,
    position: 'absolute',
  },
  headerTitle: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingVertical: 8,
    paddingHorizontal: 15,
    paddingTop: headerHeight / 3.5,
    width: '100%',
    height: '100%',
    backgroundColor: transparentLight,
  },
  profileMatchOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 3,
  },
  locationOverlay: {
    position: 'absolute',
    bottom: 0,
    padding: 5,
    width: '100%',
    backgroundColor: transparentDark,
  },
  location: {
    color: 'white',
    fontSize: 13,
  },
  indicator: {
    marginTop: (height - headerHeight) / 2.5,
  },
}

export const mapStateToProps = ({ galleryInfo }) => ({
  data: galleryInfo.data,
  isLoading: galleryInfo.isLoading,
  hasError: galleryInfo.hasError,
  loadingMessage: galleryInfo.loadingMessage,
})

export const mapDispatchToProps = dispatch => ({
  getGalleryArtwork: galleryId => dispatch({
    type: actions.REQUEST_ART_LIST,
    payload: { galleryId },
  }),
  getArtworkForGenre: genre => dispatch({
    type: actions.REQUEST_ART_LIST,
    payload: {
      genres: [genre],
    },
  }),
  getProfileArtwork: () => dispatch({
    type: actions.REQUEST_PROFILE_ART_LIST,
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
