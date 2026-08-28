package com.example.best3

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.best3.data.FirebaseManager
import com.example.best3.navigation.Screen
import com.example.best3.navigation.StyleAiNavGraph
import com.example.best3.ui.theme.StyleAiTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            StyleAiTheme {
                // Always start with Splash for a premium entry experience
                StyleAiNavGraph(startDestination = Screen.Splash.route)
            }
        }
    }
}