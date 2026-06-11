package com.example.best3.ui.profile

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun OrderTrackingScreenPreview() {
    StyleAiTheme {
        OrderTrackingScreen(onBackClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderTrackingScreen(
    productName: String = "Azure Linen Shirt",
    price: String = "₹4,399",
    imageUrl: String = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
    onBackClick: () -> Unit,
    onCompleteClick: () -> Unit = onBackClick
) {
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Track Order", fontWeight = FontWeight.ExtraBold, color = Color.Black) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(White, Color(0xFF2C3E50))))
                .verticalScroll(rememberScrollState())
        ) {
            // Product Preview Card
            Surface(
                modifier = Modifier.padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                color = White,
                shadowElevation = 2.dp
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = null,
                        modifier = Modifier.size(70.dp).clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop,
                        placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text("Order #ST12345", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        Text(productName, fontWeight = FontWeight.ExtraBold, color = Color.Black)
                        Text(price, fontWeight = FontWeight.ExtraBold, color = AccentBlue)
                    }
                }
            }

            // Arrival Time Card
            Surface(
                modifier = Modifier.padding(horizontal = 16.dp),
                shape = RoundedCornerShape(24.dp),
                color = AccentBlue,
                shadowElevation = 4.dp
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Estimated Arrival", color = White.copy(alpha = 0.8f), fontSize = 14.sp)
                            Text("Today, 04:30 PM", color = White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                        Icon(Icons.Default.LocalShipping, null, tint = White, modifier = Modifier.size(32.dp))
                    }
                }
            }

            // Tracking Timeline
            Column(modifier = Modifier.padding(24.dp)) {
                TrackingStep("Order Placed", "21 Oct, 10:30 AM", true, true)
                TrackingStep("Processing", "21 Oct, 02:00 PM", true, true)
                TrackingStep("Shipped", "22 Oct, 09:00 AM", true, true)
                TrackingStep("Out for Delivery", "Today, 08:00 AM", true, false)
                TrackingStep("Delivered", "Expected by 04:30 PM", false, false, isLast = true)
            }

            // Delivery Partner
            Text(
                "Delivery Partner",
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
                fontWeight = FontWeight.Bold,
                color = White
            )
            Surface(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp).padding(bottom = 32.dp),
                shape = RoundedCornerShape(24.dp),
                color = White,
                shadowElevation = 1.dp
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
                        contentDescription = null,
                        modifier = Modifier.size(50.dp).clip(CircleShape),
                        contentScale = ContentScale.Crop,
                        placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Rahul Sharma", fontWeight = FontWeight.Bold)
                        Text("Verified Delivery Professional", fontSize = 12.sp, color = Color.Gray)
                    }
                    IconButton(
                        onClick = {},
                        modifier = Modifier.background(LightBlue.copy(alpha = 0.3f), CircleShape)
                    ) {
                        Icon(Icons.Default.Call, null, tint = AccentBlue)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            // Completed Button
            Button(
                onClick = onCompleteClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)) // Green color for "Completed"
            ) {
                Icon(Icons.Default.CheckCircle, null, tint = White)
                Spacer(modifier = Modifier.width(12.dp))
                Text("Order Completed", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            
            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}

@Composable
fun TrackingStep(title: String, time: String, isCompleted: Boolean, isActive: Boolean, isLast: Boolean = false) {
    Row(modifier = Modifier.height(IntrinsicSize.Min)) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Surface(
                modifier = Modifier.size(24.dp),
                shape = CircleShape,
                color = if (isCompleted) AccentBlue else Color.Transparent,
                border = if (!isCompleted) BorderStroke(2.dp, Color.LightGray) else null
            ) {
                if (isCompleted) Icon(Icons.Default.Check, null, tint = White, modifier = Modifier.padding(4.dp))
            }
            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .fillMaxHeight()
                        .background(if (isActive) AccentBlue else Color.LightGray)
                )
            }
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.padding(bottom = 24.dp)) {
            Text(
                text = title,
                fontWeight = if (isActive || isCompleted) FontWeight.Bold else FontWeight.Medium,
                color = if (isActive || isCompleted) Color.Black else Color.Gray
            )
            Text(text = time, fontSize = 12.sp, color = Color.Gray)
        }
    }
}
