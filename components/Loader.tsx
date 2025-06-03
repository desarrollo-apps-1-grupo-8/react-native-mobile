import { Colors } from '@/constants/Colors';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Loader({ 
  size = 50, 
  strokeWidth = 4,
  activeColor = 'white',
  inactiveColor = 'rgba(255, 255, 255, 0.2)'
}) {
  // Animation values
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0.1);
  
  // Calculate dimensions
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    // Rotation animation for the white arc
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 2000, 
        easing: Easing.linear 
      }), 
      -1, // Infinite
      false
    );
    
    // Growing and shrinking animation for the white arc
    progress.value = withRepeat(
      withSequence(
        // Grow from 10% to 80%
        withTiming(0.8, { 
          duration: 1500, 
          easing: Easing.inOut(Easing.ease) 
        }),
        // Shrink from 80% to 10%
        withTiming(0.1, { 
          duration: 1500, 
          easing: Easing.inOut(Easing.ease) 
        })
      ),
      -1, // Infinite
      false
    );
  }, []);
  
  // Animated style for rotation of the white arc
  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  // Animated props for the white arc (grows and shrinks)
  const whiteArcProps = useAnimatedProps(() => {
    return {
      strokeDasharray: `${circumference * progress.value} ${circumference * (1 - progress.value)}`,
    };
  });
  
  // Full gray circle as background
  const grayCircleProps = {
    cx: center,
    cy: center,
    r: radius,
    stroke: inactiveColor,
    strokeWidth: strokeWidth,
    fill: "transparent"
  };
  
  return (
    <View style={styles.container}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle {...grayCircleProps} />
        <Animated.View 
        style={[
          styles.rotatingArcContainer,
          { width: size, height: size },
          rotationStyle
        ]}
      >
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          {/* White arc that grows and shrinks while rotating */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            animatedProps={whiteArcProps}
          />
        </Svg>
      </Animated.View>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});