package com.example.best3.ui.profile

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun RewardsScreenPreview() {
    StyleAiTheme {
        RewardsScreen(onBackClick = {})
    }
}

data class Coupon(
    val title: String,
    val description: String,
    val code: String,
    val expiry: String,
    val color: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RewardsScreen(onBackClick: () -> Unit) {
    val coupons = listOf(
        Coupon("Welcome Bonus", "Get ₹500 off on your first order above ₹2000.", "STYLE500", "Exp: 31 Dec", Color(0xFF81D4FA)),
        Coupon("Eco-Warrior", "15% off for recycling your old clothes.", "ECO15", "Exp: 15 Nov", Color(0xFF81C784)),
        Coupon("AI Stylist Pick", "Flat 10% off on AI recommended items.", "AISTYLE", "Exp: 30 Nov", Color(0xFFF06292))
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Rewards & Points", fontWeight = FontWeight.ExtraBold) },
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
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.05f))))
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            // Points Balance Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = AccentBlue),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Total Style Points", color = White.copy(alpha = 0.8f), fontSize = 14.sp)
                    Text("2,450", color = White, fontSize = 48.sp, fontWeight = FontWeight.Black)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { },
                        colors = ButtonDefaults.buttonColors(containerColor = White),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Redeem Points", color = AccentBlue, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Text("Exclusive Coupons", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(16.dp))

            coupons.forEach { coupon ->
                CouponItem(coupon)
                Spacer(modifier = Modifier.height(16.dp))
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Refer & Earn Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = LightBlue.copy(alpha = 0.2f)),
                border = BorderStroke(1.dp, AccentBlue.copy(alpha = 0.1f))
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Invite Friends", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                        Text("Get 500 points each", fontSize = 12.sp, color = Color.Gray)
                    }
                    Button(
                        onClick = { /* Share link */ },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                    ) {
                        Icon(Icons.Default.Share, null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Share", fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Text("How to earn points?", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(12.dp))
            EarnStep("Shop Sustainable", "Earn 10 points for every ₹100 spent on eco-fabrics.", Icons.Default.Eco)
            EarnStep("Log Skin Comfort", "Earn 50 points every time you log a daily entry.", Icons.Default.MenuBook)
            EarnStep("Refer a Friend", "Earn 500 points when a friend makes their first purchase.", Icons.Default.GroupAdd)
        }
    }
}

@Composable
fun CouponItem(coupon: Coupon) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        color = White,
        border = BorderStroke(1.dp, coupon.color.copy(alpha = 0.3f)),
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(coupon.color.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.ConfirmationNumber, null, tint = coupon.color, modifier = Modifier.size(30.dp))
            }
            Spacer(modifier = Modifier.width(20.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(coupon.title, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                Text(coupon.description, fontSize = 12.sp, color = Color.Gray, lineHeight = 16.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = coupon.code,
                        color = coupon.color,
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp,
                        modifier = Modifier
                            .background(coupon.color.copy(alpha = 0.05f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(coupon.expiry, fontSize = 11.sp, color = Color.LightGray, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun EarnStep(title: String, desc: String, icon: ImageVector) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.Top
    ) {
        Surface(
            modifier = Modifier.size(40.dp),
            shape = RoundedCornerShape(12.dp),
            color = SoftGray
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
            }
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text(desc, fontSize = 13.sp, color = Color.Gray, lineHeight = 18.sp)
        }
    }
}
