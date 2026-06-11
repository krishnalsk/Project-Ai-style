package com.example.best3.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Help
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
fun SettingsScreenPreview() {
    StyleAiTheme {
        SettingsScreen(onBackClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBackClick: () -> Unit) {
    var notificationsEnabled by remember { mutableStateOf(true) }
    var darkModeEnabled by remember { mutableStateOf(false) }
    var aiPersonalization by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Settings", fontWeight = FontWeight.ExtraBold, color = Color.Black) },
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
                .padding(16.dp)
        ) {
            SettingsGroup("App Preferences") {
                ToggleSettingItem("Push Notifications", Icons.Default.Notifications, notificationsEnabled) { notificationsEnabled = it }
                ToggleSettingItem("Dark Mode", Icons.Default.DarkMode, darkModeEnabled) { darkModeEnabled = it }
                ActionSettingItem("Language", Icons.Default.Language, "English (US)")
            }

            SettingsGroup("AI Customization") {
                ToggleSettingItem("Personalized Recommendations", Icons.Default.AutoAwesome, aiPersonalization) { aiPersonalization = it }
                ActionSettingItem("Skin Profile Analysis", Icons.Default.Face, "View/Edit")
                ActionSettingItem("Style Archetype", Icons.Default.Style, "Casual Modern")
            }

            SettingsGroup("Security & Privacy") {
                ActionSettingItem("Privacy Policy", Icons.Default.PrivacyTip)
                ActionSettingItem("Terms of Service", Icons.Default.Description)
                ActionSettingItem("Two-Factor Authentication", Icons.Default.Security, "Disabled")
            }

            SettingsGroup("Support") {
                ActionSettingItem("Help Center", Icons.AutoMirrored.Filled.Help)
                ActionSettingItem("Report a Bug", Icons.Default.BugReport)
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = "Version 1.0.4 (Build 42)",
                modifier = Modifier.fillMaxWidth(),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                color = Color.LightGray,
                fontSize = 12.sp
            )
        }
    }
}

@Composable
fun SettingsGroup(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier = Modifier.padding(vertical = 12.dp)) {
        Text(
            text = title,
            modifier = Modifier.padding(start = 12.dp, bottom = 8.dp),
            style = MaterialTheme.typography.labelMedium.copy(color = Color.Black, fontWeight = FontWeight.ExtraBold)
        )
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = White,
            shadowElevation = 1.dp
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                content()
            }
        }
    }
}

@Composable
fun ToggleSettingItem(label: String, icon: ImageVector, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(label, fontWeight = FontWeight.Medium)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedThumbColor = White, checkedTrackColor = AccentBlue)
        )
    }
}

@Composable
fun ActionSettingItem(label: String, icon: ImageVector, value: String? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(label, fontWeight = FontWeight.Medium)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (value != null) {
                Text(value, color = Color.Gray, fontSize = 14.sp)
                Spacer(modifier = Modifier.width(8.dp))
            }
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = Color.LightGray)
        }
    }
}
