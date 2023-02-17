//
//  HelloView.swift
//  Nostore
//
//  Created by Ryan Breen on 2/17/23.
//

import SwiftUI

struct MainView: View {
    var body: some View {
        VStack {
            NavigationStack {
                Image("bigicon").resizable().frame(width: 150.0, height: 150.0)
                Text("Nostore").font(.title)
                Text("A Safari Nostr Extension").font(.title2)
                NavigationLink("Privacy Policy") {
                    PrivacyPolicyView()
                }
                #if macOS
                .buttonStyle(.link)
                #endif
                .padding(.all, 3.0)
                
                NavigationLink("Getting Started: iPhone") {
                    GettingStartediPhone()
                }
                #if macOS
                .buttonStyle(.link)
                #endif
                .padding(.all, 3.0)
                
                NavigationLink("Getting Started: iPad") {
                    GettingStartediPad()
                }
                #if macOS
                .buttonStyle(.link)
                #endif
                .padding(.all, 3.0)
                
                NavigationLink("Getting Started: MacOS") {
                    GettingStartedmacOS()
                }
                #if macOS
                .buttonStyle(.link)
                #endif
                .padding(.all, 3.0)

                NavigationLink("Tips and Tricks") {
                    TipsAndTricks()
                }
                #if macOS
                .buttonStyle(.link)
                #endif
                .padding(.all, 3.0)
            }
        }
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
