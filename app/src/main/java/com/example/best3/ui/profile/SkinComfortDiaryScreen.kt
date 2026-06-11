package com.example.best3.ui.profile

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun SkinComfortDiaryScreenPreview() {
    StyleAiTheme {
        SkinComfortDiaryScreen(onBackClick = {})
    }
}

data class DiaryEntry(
    val date: String,
    val day: String,
    val comfortLevel: Int, // 0 to 100
    val condition: String,
    val fabricWorn: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SkinComfortDiaryScreen(onBackClick: () -> Unit) {
    val entries = listOf(
        DiaryEntry("25 Oct", "Today", 95, "Perfect", "Organic Linen"),
        DiaryEntry("24 Oct", "Yesterday", 88, "Good", "Bamboo Cotton"),
        DiaryEntry("23 Oct", "Wed", 70, "Slight Itch", "Synthetic Blend"),
        DiaryEntry("22 Oct", "Tue", 92, "Great", "Pure Silk"),
        DiaryEntry("21 Oct", "Mon", 85, "Good", "Organic Cotton")
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { 
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Skin Comfort Diary", fontWeight = FontWeight.ExtraBold)
                        Text("Track your daily skin safety", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = { /* Share report */ }) {
                        Icon(Icons.Default.Share, null, tint = AccentBlue)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* Add new entry */ },
                containerColor = AccentBlue,
                contentColor = White,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Add, null)
            }
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
            // Summary Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier.padding(24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(
                            progress = { 0.86f },
                            modifier = Modifier.size(80.dp),
                            color = AccentBlue,
                            strokeWidth = 8.dp,
                            trackColor = LightBlue.copy(alpha = 0.2f)
                        )
                        Text("86%", fontWeight = FontWeight.Black, fontSize = 18.sp, color = AccentBlue)
                    }
                    Spacer(modifier = Modifier.width(24.dp))
                    Column {
                        Text("Weekly Average", color = Color.Gray, fontSize = 14.sp)
                        Text("Highly Comfortable", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                        Text("Keep choosing Linen & Silk", color = Color(0xFF4CAF50), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Text("Daily Logs", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(16.dp))

            entries.forEach { entry ->
                DiaryEntryItem(entry)
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun DiaryEntryItem(entry: DiaryEntry) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        color = White,
        shadowElevation = 4.dp,
        border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.1f))
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier
                    .width(64.dp)
                    .background(LightBlue.copy(alpha = 0.05f), RoundedCornerShape(16.dp))
                    .padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(entry.date, fontWeight = FontWeight.Black, fontSize = 14.sp, color = AccentBlue)
                Text(entry.day, color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(entry.condition, fontWeight = FontWeight.ExtraBold, color = Color.Black, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier.size(16.dp).background(AccentBlue.copy(alpha = 0.1f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Checkroom, null, tint = AccentBlue, modifier = Modifier.size(10.dp))
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(entry.fabricWorn, color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
            
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(
                        color = when {
                            entry.comfortLevel >= 90 -> Color(0xFFE8F5E9)
                            entry.comfortLevel >= 80 -> Color(0xFFFFF9C4)
                            else -> Color(0xFFFFEBEE)
                        },
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "${entry.comfortLevel}%",
                    fontWeight = FontWeight.Black,
                    fontSize = 15.sp,
                    color = when {
                        entry.comfortLevel >= 90 -> Color(0xFF2E7D32)
                        entry.comfortLevel >= 80 -> Color(0xFFFBC02D)
                        else -> Color(0xFFC62828)
                    }
                )
            }
        }
    }
}
