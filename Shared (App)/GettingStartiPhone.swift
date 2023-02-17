//
//  GettingStartediPhone.swift
//  Nostore
//
//  Created by Ryan Breen on 2/18/23.
//

import SwiftUI

struct GettingStartediPhone: View {
    var body: some View {
        ScrollView {
            Text("Getting Started")
                .font(.largeTitle)
                .foregroundColor(.accentColor)
            Text("iPhone")
                .font(.title)
                .foregroundColor(.accentColor)
            Spacer(minLength: 20.0)
            Text("Upon installation of the app, goto **Settings -> Safari -> Extension** and enable the **Nostore** extension. Then open Safari and look in the toolbar, where you will see the \(Image(systemName: "textformat.size")) icon:")
                .padding([.horizontal, .top], 20)

            Image("iphone-url-bar")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 512)
                .border(Color.accentColor, width: 2)
                .padding([.top])

            Text("You will be greeted by a menu like below:").padding([.top], 20)
            
            Image("iphone-menu")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 512)
                .border(Color.accentColor, width: 2)
                .padding([.top])

            Text("""
The **Nostore** logo is gray, indicating the extension is inactive for this site, and must be activated first. Click on the button, and give Nostore permission to access the current site. Now the Nostore logo will appear in color, and you can click it again to access the extension.
""").multilineTextAlignment(.leading)
                .padding([.horizontal, .top], 20)
            
            Image("iphone-popup")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 512)
                .border(Color.accentColor, width: 2)
                .padding([.top])
            
            Text("You have a default profile (with a random key) setup to start. Click the **Settings** button to configure your own keys, if you have them.").padding([.top, .bottom], 20)
        }
    }
}

struct GettingStartediPhone_Previews: PreviewProvider {
    static var previews: some View {
        GettingStartediPhone()
    }
}
