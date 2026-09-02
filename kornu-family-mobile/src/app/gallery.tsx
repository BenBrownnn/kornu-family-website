import { StyleSheet, Text, View } from 'react-native';

export default function GalleryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gallery</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
});