package com.example.best3.ui.home

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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun WashCareGuideScreenPreview() {
    StyleAiTheme {
        WashCareGuideScreen(onBackClick = {})
    }
}

data class CareInstruction(
    val fabric: String,
    val icon: ImageVector,
    val color: Color,
    val steps: List<String>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WashCareGuideScreen(onBackClick: () -> Unit) {
    val guides = listOf(
        CareInstruction(
            "Merino Wool",
            Icons.Default.Waves,
            Color(0xFF5C6BC0),
            listOf(
                "Hand wash in cold water using wool detergent.",
                "Avoid wringing; gently squeeze out excess water.",
                "Dry flat on a towel away from direct sunlight.",
                "Store folded to maintain the garment's shape."
            )
        ),
        CareInstruction(
            "Organic Cotton",
            Icons.Default.DryCleaning,
            Color(0xFF66BB6A),
            listOf(
                "Machine wash on a gentle cycle with like colors.",
                "Use mild, eco-friendly detergent to protect fibers.",
                "Tumble dry on low heat or line dry in the shade.",
                "Iron while slightly damp for the best results."
            )
        ),
        CareInstruction(
            "Bamboo Fiber",
            Icons.Default.Eco,
            Color(0xFF26A69A),
            listOf(
                "Wash in cold or lukewarm water on a delicate cycle.",
                "Avoid bleach and fabric softeners.",
                "Line dry to preserve the natural anti-bacterial properties.",
                "Store in a cool, dry place to prevent moisture build-up."
            )
        )
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Wash & Care Guide", fontWeight = FontWeight.ExtraBold) },
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
            Text(
                "Keep your skin-safe fabrics soft and durable with our expert care tips.",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(32.dp))

            guides.forEach { guide ->
                CareCard(guide)
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun CareCard(guide: CareInstruction) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = BorderStroke(1.dp, guide.color.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier.size(48.dp),
                    color = guide.color.copy(alpha = 0.1f),
                    shape = CircleShape
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(guide.icon, null, tint = guide.color, modifier = Modifier.size(24.dp))
                    }
                }
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    text = guide.fabric,
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            guide.steps.forEachIndexed { index, step ->
                Row(modifier = Modifier.padding(vertical = 4.dp)) {
                    Text(
                        text = "${index + 1}.",
                        fontWeight = FontWeight.Bold,
                        color = guide.color,
                        modifier = Modifier.width(24.dp)
                    )
                    Text(
                        text = step,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.DarkGray,
                        lineHeight = 20.sp
                    )
                }
            }
        }
    }
}
