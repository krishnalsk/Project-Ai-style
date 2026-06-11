package com.example.best3.ui.splash

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Checkroom
import androidx.compose.material.icons.outlined.Eco
import androidx.compose.material.icons.outlined.Spa
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onFinished: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "splash")
    
    // Initial animation state
    var startAnimation by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        startAnimation = true
        delay(3000) // Show splash for 3 seconds
        onFinished()
    }

    // Animations
    val logoScale by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0.5f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "logoScale"
    )
    
    val textFade by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(1500, delayMillis = 500),
        label = "textFade"
    )

    val floatingOffset by infiniteTransition.animateFloat(
        initialValue = -15f,
        targetValue = 15f,
        animationSpec = infiniteRepeatable(
            animation = tween(2500, easing = LinearOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "floating"
    )

    val waveOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 2000f,
        animationSpec = infiniteRepeatable(
            animation = tween(10000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "wave"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(White, LightBlue)
                )
            )
    ) {
        // Floating Blur Circles (Background)
        BlurCircle(color = PastelGreen.copy(alpha = 0.4f), size = 250, offset = Offset(-100f, 150f))
        BlurCircle(color = AccentBlue.copy(alpha = 0.15f), size = 350, offset = Offset(400f, 600f))

        // Content
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo Card with Glassmorphism effect
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(160.dp)
                    .scale(logoScale)
            ) {
                // Glass background layer
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(40.dp))
                        .background(White.copy(alpha = 0.6f))
                        .border(
                            width = 1.dp,
                            brush = Brush.linearGradient(
                                colors = listOf(White.copy(alpha = 0.8f), White.copy(alpha = 0.2f))
                            ),
                            shape = RoundedCornerShape(40.dp)
                        )
                        .blur(12.dp)
                )
                
                // Logo Content
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Checkroom,
                        contentDescription = "Hanger Logo",
                        modifier = Modifier.size(72.dp),
                        tint = AccentBlue
                    )
                    Icon(
                        imageVector = Icons.Outlined.Eco,
                        contentDescription = "Leaf Logo",
                        modifier = Modifier
                            .size(28.dp)
                            .offset(x = 24.dp, y = (-12).dp),
                        tint = PastelGreen
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // App Name & Tagline
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.alpha(textFade)
            ) {
                Text(
                    text = "Style AI",
                    style = MaterialTheme.typography.displaySmall.copy(
                        fontWeight = FontWeight.ExtraBold,
                        color = AccentBlue,
                        letterSpacing = 2.sp,
                        fontFamily = FontFamily.SansSerif
                    )
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Smart Comfort Meets Style",
                    style = MaterialTheme.typography.titleMedium.copy(
                        color = Color.Gray.copy(alpha = 0.8f),
                        letterSpacing = 1.5.sp,
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Light
                    ),
                    textAlign = TextAlign.Center
                )
            }
        }

        // Floating Decorative Icons
        FloatingIcon(
            Icons.Outlined.Eco, 
            Modifier.align(Alignment.TopStart).offset(60.dp, 120.dp + floatingOffset.dp)
        )
        FloatingIcon(
            Icons.Outlined.Checkroom, 
            Modifier.align(Alignment.TopEnd).offset((-80).dp, 220.dp - floatingOffset.dp)
        )
        FloatingIcon(
            Icons.Outlined.Spa, 
            Modifier.align(Alignment.BottomStart).offset(100.dp, (-250).dp + (floatingOffset * 0.5f).dp)
        )

        // Bottom Elements Container
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = 80.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .size(36.dp),
                    color = AccentBlue,
                    strokeWidth = 3.dp
                )
                
                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = onFinished,
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(56.dp)
                        .alpha(textFade),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
                ) {
                    Text(
                        text = "Get Started",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = White,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }

        // Fabric Wave Design at the bottom
        FabricWave(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(150.dp),
            offset = waveOffset
        )
    }
}

@Composable
fun BlurCircle(color: Color, size: Int, offset: Offset) {
    Canvas(modifier = Modifier.size(size.dp).offset(offset.x.dp, offset.y.dp)) {
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(color, Color.Transparent),
            ),
            radius = size.dp.toPx()
        )
    }
}

@Composable
fun FloatingIcon(icon: ImageVector, modifier: Modifier = Modifier) {
    Icon(
        imageVector = icon,
        contentDescription = null,
        modifier = modifier
            .size(36.dp)
            .alpha(0.15f),
        tint = AccentBlue
    )
}

@Composable
fun FabricWave(modifier: Modifier, offset: Float) {
    Canvas(modifier = modifier) {
        val path = Path()
        val width = size.width
        val height = size.height
        
        // Primary Wave
        path.moveTo(0f, height)
        for (i in 0..width.toInt() step 5) {
            val y = height - (25f * kotlin.math.sin((i + offset) * 0.015f) + 60f)
            path.lineTo(i.toFloat(), y)
        }
        path.lineTo(width, height)
        path.close()
        
        drawPath(
            path = path,
            color = LightBlue.copy(alpha = 0.6f)
        )
        
        // Secondary Wave
        val path2 = Path()
        path2.moveTo(0f, height)
        for (i in 0..width.toInt() step 5) {
            val y = height - (20f * kotlin.math.sin((i - offset * 0.7f) * 0.01f) + 40f)
            path2.lineTo(i.toFloat(), y)
        }
        path2.lineTo(width, height)
        path2.close()
        
        drawPath(
            path = path2,
            color = PastelGreen.copy(alpha = 0.4f)
        )
    }
}

@Preview(showBackground = true, device = "spec:width=411dp,height=891dp")
@Composable
fun SplashScreenPreview() {
    StyleAiTheme {
        SplashScreen({})
    }
}
