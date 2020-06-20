/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import {Overlay, Icon, Button} from 'react-native-elements';
import Spacer from '../components/Spacer';
import CocktailThumbnailButton from '../components/CocktailThumbnailButton';
import {deleteRecipe} from '../api/Cloud';
import {getIngredients} from '../api/Control';

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

const recipeOverlayWidth = screenWidth / 1.2;
const recipeOverlayHeight = 570;
const imageSize = 100;

const shotSize = 1.5; //fl oz

class EditRecipeOverlay extends React.Component {
  state = {
    recipeName: this.props.cocktailName,
    ingredients: {},
  };

  componentDidMount() {
    getIngredients(this.state.recipeName)
      .then(response => {
        this.setState({
          ingredients: response,
        });
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <Overlay
        width={recipeOverlayWidth}
        height={recipeOverlayHeight}
        visible={this.props.visible}
        overlayStyle={styles.overlay}>
        <View style={styles.backButtonRow}>
          <TouchableOpacity
            onPress={() => {
              //TODO: Reset the component and use callback to close overlay
              this.props.closeCallback();
            }}>
            <Icon name="back" size={33} type="antdesign" />
          </TouchableOpacity>
        </View>

        <Text style={styles.textStyle}>Edit Recipe</Text>

        <View style={styles.topSection}>
          <CocktailThumbnailButton
            name={this.state.recipeName}
            requestImage={true}
            imageStyle={styles.imageStyle}
          />
          <View style={styles.topEditContainer}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 18,
                textDecorationLine: 'underline',
              }}>
              {this.state.recipeName}
            </Text>
            <Button
              buttonStyle={styles.deleteButton}
              title="Delete Cocktail"
              onPress={() => {
                Alert.alert(
                  'Confirm Delete',
                  'Are you sure you want to delete this recipe?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => {},
                    },
                    {
                      text: 'Delete',
                      onPress: () => {
                        //Delete from dynamo (Maybe delete photo from S3 in the future)
                        deleteRecipe(this.state.recipeName).then(res => {
                          if (res === true) {
                            Alert.alert(
                              'Successfully deleted ' +
                                this.state.recipeName +
                                ' from the database.',
                            );
                          } else {
                            Alert.alert(
                              'There was an error trying to delete ' +
                                this.state.recipeName +
                                ' from the database.',
                            );
                          }
                        });
                        //TODO: Tell Barbot (and IoT core) to refresh list
                      },
                    },
                  ],
                );
              }}
            />
          </View>
        </View>
        <Text style={styles.ingredientLabel}>Ingredients</Text>
        <ScrollView
          style={{maxHeight: 120}}
          contentContainerStyle={styles.ingredientScroll}>
          {Object.keys(this.state.ingredients).map(key => (
            <View style={styles.ingredientContainer}>
              <Text style={styles.ingredientText}>
                {key +
                  ':  ' +
                  this.state.ingredients[key] * shotSize +
                  ' (fl oz)'}
              </Text>
              <Icon
                name="remove"
                type="font-awesome"
                color="red"
                onPress={() => {//TODO: Remove ingredients from the state object
                }}
              />
            </View>
          ))}
        </ScrollView>
      </Overlay>
    );
  }
}

export default EditRecipeOverlay;

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 20,
    backgroundColor: 'lightgray',
  },
  backButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  textStyle: {
    fontSize: 20,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  imageStyle: {
    width: imageSize,
    height: imageSize,
    borderRadius: 20,
    alignSelf: 'center',
  },
  topSection: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
    maxHeight: imageSize + 15,
    textAlign: 'center',
  },

  topEditContainer: {
    flexDirection: 'column',
    width: recipeOverlayWidth - imageSize - 20,
    height: imageSize,
  },

  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 10,
    marginTop: 15,
    marginLeft: 8,
  },

  ingredientScroll: {
    backgroundColor: 'darkgray',
    borderRadius: 5,
    marginHorizontal: 10,
  },

  ingredientText: {
    fontSize: 18,
    paddingBottom: 4,
  },

  ingredientContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    paddingVertical: 5,
  },

  ingredientLabel: {
    textAlign: 'center',
    fontSize: 18,
    textDecorationLine: 'underline',
    marginBottom: 2,
  },
});