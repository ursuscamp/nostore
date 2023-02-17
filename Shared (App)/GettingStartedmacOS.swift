//
//  GettingStartedmacOS.swift
//  Nostore
//
//  Created by Ryan Breen on 2/18/23.
//

import SwiftUI

struct GettingStartedmacOS: View {
    var body: some View {
        ScrollView {
            Text("Getting Started")
                .font(.largeTitle)
                .foregroundColor(.accentColor)
            Text("macOS")
                .font(.title)
                .foregroundColor(.accentColor)
            Text("")
            Text("Upon installation of the app, open Safari. Click on the **Safari menu -> Settings... -> Extensions tab** and activate the **Nostore** extension. You will now see the Nostore icon in your Safari toolbar. For example:")
                .padding([.horizontal, .top], 20)

            Image("macos-toolbar-inactive")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 512)
                .border(Color.accentColor, width: 2)
                .padding([.top])

            Text("""
On the right, you can see the Nostore logo, and it is gray (or **inactive**). This means that it does not have permission to access the current website.

The first time you visit a Nostr client, you will need to click the icon to give Nostore permission to access the site.

Once active, the icon will become colored and you can select it again, where you will be greeted with a similar popup:
""").multilineTextAlignment(.leading)
                .padding([.horizontal, .top], 20)
            
            Image("macos-default-popup")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 512)
                .border(Color.accentColor, width: 2)
                .padding([.top])
            
            Text("You have a default profile (with a random key) setup to start. Click the **Settings** button to configure your own keys, if you have them.").padding([.top, .bottom], 20)
        }

    }
}

struct GettingStartedmacOS_Previews: PreviewProvider {
    static var previews: some View {
        GettingStartedmacOS()
    }
}
