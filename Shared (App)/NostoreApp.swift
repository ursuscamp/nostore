//
//  File.swift
//  Nostore
//
//  Created by Ryan Breen on 2/17/23.
//

import SwiftUI

@main
struct NostoreApp: App {
    var body: some Scene {
        WindowGroup("Nostore") {
            MainView()
        }
        #if macOS
        .defaultSize(width: 400, height: 500)
        #endif
    }
}
