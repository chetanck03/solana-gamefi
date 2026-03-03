import React, { useState } from 'react';
import { Image, View, ActivityIndicator, ImageProps, StyleSheet } from 'react-native';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: any;
  fallbackIcon?: React.ReactNode;
  showLoader?: boolean;
}

export default function OptimizedImage({ 
  source, 
  fallbackIcon, 
  showLoader = false,
  style,
  ...props 
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error && fallbackIcon) {
    return <View style={[styles.container, style]}>{fallbackIcon}</View>;
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[StyleSheet.absoluteFill, style]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
      {loading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#9945FF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
