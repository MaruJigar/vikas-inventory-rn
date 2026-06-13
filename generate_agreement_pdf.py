from fpdf import FPDF

class AgreementPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(80, 80, 80)
        self.cell(0, 5, "Vikas Marketing Field Sales & Inventory Management System", align="L")
        self.cell(0, 5, "Param Buddh  |  Jigar Maru", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(180, 180, 180)
        self.line(self.l_margin, self.get_y() + 1, self.w - self.r_margin, self.get_y() + 1)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_draw_color(180, 180, 180)
        self.line(self.l_margin, self.get_y() - 2, self.w - self.r_margin, self.get_y() - 2)
        self.set_font("Helvetica", "", 7)
        self.set_text_color(100, 100, 100)
        content_width = self.w - self.l_margin - self.r_margin
        self.cell(content_width / 2, 10, "SOFTWARE DEVELOPMENT & MAINTENANCE AGREEMENT", align="L")
        self.cell(content_width / 2, 10, f"Page {self.page_no()}/{{nb}}", align="R", new_x="LMARGIN", new_y="NEXT")

    def section_title(self, title):
        if self.will_page_break(35):
            self.add_page()
        self.ln(3)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(20, 20, 20)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(40, 40, 40)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(3)

    def sub_title(self, title):
        if self.will_page_break(25):
            self.add_page()
        self.ln(2)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(40, 40, 40)
        self.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def sub_sub_title(self, title):
        if self.will_page_break(20):
            self.add_page()
        self.ln(1)
        self.set_font("Helvetica", "BI", 9.5)
        self.set_text_color(50, 50, 50)
        self.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bullet(self, text):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)
        x = self.get_x()
        self.cell(8, 5.5, "-", new_x="END")
        self.multi_cell(0, 5.5, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(0.5)

    def label_field(self, label, width=60):
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(30, 30, 30)
        self.cell(width, 6, label + ":", new_x="END")
        self.set_font("Helvetica", "", 9.5)
        self.cell(0, 6, "_" * 50, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def label_value(self, label, value, width=60):
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(30, 30, 30)
        self.cell(width, 6, label + ":", new_x="END")
        self.set_font("Helvetica", "", 9.5)
        self.cell(0, 6, value, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def add_table(self, headers, rows, col_widths=None):
        if col_widths is None:
            col_widths = [self.epw / len(headers)] * len(headers)
        # Header
        self.set_font("Helvetica", "B", 8.5)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(20, 20, 20)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True, align="C")
        self.ln()
        # Rows
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(30, 30, 30)
        for row in rows:
            max_h = 7
            for i, cell in enumerate(row):
                self.cell(col_widths[i], max_h, str(cell), border=1, align="C" if i > 0 else "L")
            self.ln()
        self.ln(2)

    def note_text(self, text):
        self.set_font("Helvetica", "I", 8.5)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 5, text)
        self.ln(2)

    def signature_block(self, title, fields):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(20, 20, 20)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        for f in fields:
            self.set_font("Helvetica", "", 9.5)
            self.set_text_color(30, 30, 30)
            self.cell(35, 8, f + ":", new_x="END")
            self.cell(0, 8, "_" * 55, new_x="LMARGIN", new_y="NEXT")
            self.ln(3)


def generate_agreement():
    pdf = AgreementPDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_margins(20, 20, 20)
    pdf.add_page()

    # ===== TITLE =====
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 12, "SOFTWARE DEVELOPMENT &", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 12, "MAINTENANCE AGREEMENT", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)
    pdf.set_draw_color(40, 40, 40)
    pdf.set_line_width(0.5)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.set_line_width(0.2)
    pdf.ln(5)

    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(35, 7, "Agreement Date:", new_x="END")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, "_____ / _____ / 2026", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(35, 7, "Project Title:", new_x="END")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, "Vikas Marketing Field Sales & Inventory Management System", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # ===== PARTIES =====
    pdf.section_title("PARTIES")

    pdf.sub_title("Developer (Service Provider):")
    pdf.label_value("Name", "Param Buddh")
    pdf.label_value("Contact", "9426516080")
    pdf.label_value("Email", "parambuddh26@gmail.com")
    pdf.ln(2)
    pdf.label_value("Name", "Jigar Maru")
    pdf.label_value("Contact", "8141155884")
    pdf.label_value("Email", "jigarmaru31@gmail.com")
    pdf.ln(3)

    pdf.sub_title("Client:")
    pdf.label_value("Name", "Vikas Marketing")
    pdf.label_field("Contact Person")
    pdf.label_field("Contact")
    pdf.label_field("Email")

    # ===== 1. PROJECT OVERVIEW =====
    pdf.section_title("1. PROJECT OVERVIEW")
    pdf.body_text(
        "The Developer agrees to design, develop, and maintain a mobile-first Field Sales and "
        "Inventory Management application for the Client. The application will serve as a unified "
        "platform for managing sales operations, distributor coordination, product cataloging, and "
        "order tracking across the Client's field workforce."
    )
    pdf.body_text(
        "The system will be delivered as a single application with role-based access for three "
        "user types: Administrator, Salesman, and Distributor."
    )
    
    pdf.sub_title("1.1 Delivery Timeline")
    pdf.body_text("The estimated time required for the complete development, testing, and initial deployment of the application is one (1) month from the date of signing this agreement.")

    # ===== 2. SCOPE OF WORK =====
    pdf.section_title("2. SCOPE OF WORK")
    pdf.sub_title("2.1 Application Modules")

    pdf.sub_sub_title("A. Authentication & User Management")
    pdf.bullet("Single login screen with phone number and password-based authentication.")
    pdf.bullet("Role-based access control (Admin, Salesman, Distributor).")
    pdf.bullet("New user registration with mandatory Admin approval before access is granted.")
    pdf.bullet("User profile management.")

    pdf.sub_sub_title("B. Admin Panel")
    pdf.bullet("Dashboard with business analytics (total orders, revenue, active users).")
    pdf.bullet("User approval and rejection workflow for new Salesman and Distributor registrations.")
    pdf.bullet("Salesman and Distributor management (view, suspend, remove).")
    pdf.bullet("Order monitoring and status management across all users.")
    pdf.bullet("Attendance tracking and location logs for all Salesmen.")

    pdf.sub_sub_title("C. Salesman Module")
    pdf.bullet("Daily attendance check-in and check-out with GPS location capture.")
    pdf.bullet("Access to product catalog (PDF format).")
    pdf.bullet("Shop/Customer selection and order placement.")
    pdf.bullet("Order history and status tracking.")
    pdf.bullet("GPS-stamped order submission (coordinates recorded at the time of order placement).")
    pdf.bullet("Order receipt generation and sharing (PDF format, shareable via WhatsApp or email).")
    pdf.bullet("Offline order queuing for low-connectivity areas.")

    pdf.sub_sub_title("D. Distributor Module")
    pdf.bullet("Dashboard with assigned order summary and fulfillment metrics.")
    pdf.bullet("Order review and status updates (confirm, dispatch, deliver).")
    pdf.bullet("Inventory overview against assigned products.")

    pdf.sub_sub_title("E. Product Catalog")
    pdf.bullet("Digital product catalog containing approximately 600 products.")
    pdf.bullet("Delivered as a downloadable PDF accessible within the application.")
    pdf.bullet("Product photographs for the catalog shall be provided by the Client (refer to Section 2.2).")

    pdf.sub_sub_title("F. Bilingual Support")
    pdf.bullet("Application interface available in English and Hindi.")
    pdf.bullet("Language toggle accessible from user settings.")

    pdf.sub_title("2.2 Product Catalog Deliverable")
    pdf.body_text(
        "In addition to the application, the Developer will produce a product catalog comprising "
        "approximately 600 products. This catalog will be delivered in the following formats only:"
    )
    pdf.bullet("Soft copy in PDF format (print-optimized).")
    pdf.bullet("Source file in CDR (CorelDRAW) format.")
    pdf.ln(1)
    pdf.note_text(
        "Note: The Client shall provide all product photographs required for the catalog. "
        "The Developer is responsible only for the design, layout, and compilation of the catalog "
        "using the photographs and product information supplied by the Client."
    )

    pdf.sub_title("2.3 Client-Provided Assets")
    pdf.body_text(
        "The Client is responsible for providing the following assets in a timely manner to avoid "
        "delays in development and delivery:"
    )
    pdf.bullet("Product information (names, descriptions, pricing, categories) for all catalog items.")
    pdf.bullet("Product images/photographs (minimum 600) in high-resolution digital format.")
    pdf.bullet("Customer/Shop information for initial database population.")
    pdf.bullet("Company logo in high-resolution format (PNG/SVG/AI).")
    pdf.bullet("Any necessary text content, branding guidelines, or business-specific details required for the application interface.")
    pdf.ln(1)
    pdf.note_text("Delays in providing the above assets may result in a proportional extension of the delivery timeline.")

    # ===== 3. COMMERCIAL TERMS =====
    pdf.section_title("3. COMMERCIAL TERMS")
    pdf.sub_title("3.1 Total Project Fee")
    pdf.add_table(
        ["Component", "Amount"],
        [
            ["Application Development, Deployment, Hosting & 3-Year Maintenance", "Rs. 1,25,000/-"],
        ],
        col_widths=[120, 50]
    )
    pdf.body_text("(Rupees One Lakh Twenty-Five Thousand Only)")

    pdf.sub_title("3.2 Coverage Period")
    pdf.body_text(
        "The total fee covers the following for a period of three (3) years from the date of "
        "final delivery and deployment:"
    )
    pdf.bullet("Complete application development and deployment.")
    pdf.bullet("Server hosting and infrastructure for the duration of the agreement.")
    pdf.bullet("Product catalog design and compilation.")
    pdf.bullet("Ongoing maintenance and bug resolution.")
    pdf.bullet("Minor visual and UI modifications (as defined in Section 5).")

    pdf.sub_title("3.3 Payment Schedule")
    pdf.add_table(
        ["Milestone", "Percentage", "Amount"],
        [
            ["Upon signing of this Agreement", "50%", "Rs. 62,500/-"],
            ["Upon final delivery and deployment", "50%", "Rs. 62,500/-"],
        ],
        col_widths=[100, 30, 40]
    )

    # ===== 4. HOSTING & INFRASTRUCTURE =====
    pdf.section_title("4. HOSTING & INFRASTRUCTURE")
    pdf.bullet(
        "The Developer is responsible for procuring, configuring, and maintaining the Virtual "
        "Private Server (VPS) required for hosting the application backend, database, and web "
        "assets for the duration of this agreement."
    )
    pdf.bullet("All recurring hosting and infrastructure costs are included within the total project fee specified in Section 3.1.")
    pdf.bullet("The Developer shall ensure reasonable uptime and availability of the hosted services during the agreement period.")
    pdf.bullet("If the Client requests the application to be officially hosted and distributed via the Google Play Store, an additional one-time fee of $25 (or equivalent in INR) will be charged to cover the Google Developer Account registration cost.")
    pdf.bullet("If the Client requests the application to be officially hosted and distributed via the Apple App Store (iOS), an additional yearly fee of $120 (or equivalent in INR) will be charged, which includes setup fees and Apple Developer account costs.")
    pdf.bullet("A web-based version of the application will also be provided and hosted on a free hosting platform. If the Client requires a personalized, custom domain name, any extra charges associated with purchasing and renewing that domain shall be borne by the Client.")

    # ===== 5. MAINTENANCE & SUPPORT =====
    pdf.section_title("5. MAINTENANCE & SUPPORT (3-YEAR PERIOD)")

    pdf.sub_title("5.1 Bug Fixes")
    pdf.bullet(
        "Any bugs, crashes, or functional errors reported by the Client will be acknowledged "
        "within 24 hours and resolved within 48 to 72 working hours."
    )
    pdf.bullet("Critical bugs affecting core operations (login failure, order submission failure) will be treated on priority.")

    pdf.sub_title("5.2 Minor Visual Changes")
    pdf.bullet(
        "Minor changes to the user interface such as color adjustments, text corrections, icon "
        "replacements, layout repositioning, and similar cosmetic modifications will be carried "
        "out at no additional cost during the maintenance period."
    )

    pdf.sub_title("5.3 Exclusions")
    pdf.body_text("The following are NOT included under maintenance and will require a separate written agreement and additional charges:")
    pdf.bullet("Addition of entirely new modules or features not listed in Section 2.")
    pdf.bullet("Integration with third-party services not specified in the original scope (e.g., payment gateways, ERP systems, accounting software).")
    pdf.bullet("Redesign or overhaul of the complete application interface.")
    pdf.bullet("Migration to a different technology stack.")
    pdf.bullet("Changes required due to modifications made by the Client or any third party to the codebase, server, or database without the Developer's involvement.")

    # ===== 6. INTELLECTUAL PROPERTY =====
    pdf.section_title("6. INTELLECTUAL PROPERTY & OWNERSHIP")

    pdf.sub_title("6.1 Code Ownership")
    pdf.bullet(
        "The complete source code, architecture, design systems, and all related intellectual "
        "property of the application shall remain the exclusive property of the Developer."
    )
    pdf.bullet(
        "The Client is granted a non-exclusive, non-transferable license to use the application "
        "for their business operations for the duration of this agreement."
    )

    pdf.sub_title("6.2 Data Ownership")
    pdf.bullet(
        "All business data entered into the application (orders, customer records, user information, "
        "attendance logs) is and shall remain the exclusive property of the Client."
    )
    pdf.bullet(
        "Upon termination of this agreement, the Developer will provide a complete export of all "
        "Client data in a standard format (CSV/JSON) within 15 working days of request."
    )

    pdf.sub_title("6.3 Restrictions")
    pdf.bullet(
        "The Client shall not reverse-engineer, decompile, redistribute, resell, sublicense, or "
        "create derivative works based on the application source code."
    )
    pdf.bullet(
        "The Client shall not engage a third-party developer to modify the application codebase "
        "without prior written consent from the Developer."
    )

    # ===== 7. CONFIDENTIALITY =====
    pdf.section_title("7. CONFIDENTIALITY")
    pdf.body_text(
        "Both parties agree to maintain the confidentiality of all proprietary business information, "
        "technical specifications, customer data, and commercial terms disclosed during the course "
        "of this engagement. This obligation survives the termination of this agreement."
    )

    # ===== 8. TERMINATION =====
    pdf.section_title("8. TERMINATION")

    pdf.sub_title("8.1 By Mutual Agreement")
    pdf.body_text("This agreement may be terminated at any time by mutual written consent of both parties.")

    pdf.sub_title("8.2 By the Client")
    pdf.bullet("The Client may terminate this agreement with written notice.")
    pdf.bullet("In the event of termination by the Client, any advance payment made shall remain non-refundable.")
    pdf.bullet("The Developer will provide a data export as specified in Section 6.2.")

    pdf.sub_title("8.3 By the Developer")
    pdf.bullet(
        "The Developer may terminate this agreement if payment obligations are not met within "
        "30 days of the due date, after providing written notice."
    )

    # ===== 9. LIMITATION OF LIABILITY =====
    pdf.section_title("9. LIMITATION OF LIABILITY")
    pdf.bullet(
        "The Developer shall not be held liable for any indirect, incidental, or consequential "
        "damages arising from the use or inability to use the application."
    )
    pdf.bullet(
        "The Developer's total liability under this agreement shall not exceed the total project "
        "fee specified in Section 3.1."
    )
    pdf.bullet(
        "The Developer is not responsible for data loss resulting from server failures, VPS outages, "
        "or infrastructure issues outside the Developer's control."
    )
    pdf.bullet(
        "The Developer shall not be held responsible or liable for any business profit, loss, revenue "
        "impact, or commercial outcome resulting from the use of this application. The application is "
        "a tool for operational management and does not guarantee any increase in sales, revenue, or "
        "business performance."
    )

    # ===== 10. FORCE MAJEURE =====
    pdf.section_title("10. FORCE MAJEURE")
    pdf.body_text(
        "Neither party shall be held liable for delays or failures in performance resulting from "
        "causes beyond their reasonable control, including but not limited to natural disasters, "
        "government actions, internet outages, or pandemic-related disruptions."
    )

    # ===== 11. DISPUTE RESOLUTION =====
    pdf.section_title("11. DISPUTE RESOLUTION")
    pdf.body_text(
        "Any disputes arising out of or in connection with this agreement shall first be resolved "
        "through good-faith negotiation between the parties. If unresolved within 30 days, the "
        "dispute shall be referred to arbitration in accordance with the Arbitration and Conciliation "
        "Act, 1996. The seat of arbitration shall be Jamnagar, Gujarat, India."
    )

    # ===== 12. GENERAL PROVISIONS =====
    pdf.section_title("12. GENERAL PROVISIONS")
    pdf.bullet(
        "This agreement constitutes the entire understanding between the parties and supersedes "
        "all prior discussions, negotiations, and agreements."
    )
    pdf.bullet("Any amendments to this agreement must be made in writing and signed by both parties.")
    pdf.bullet("This agreement shall be governed by the laws of India.")

    # ===== ACCEPTANCE =====
    pdf.section_title("ACCEPTANCE")
    pdf.body_text(
        "By signing below, both parties acknowledge that they have read, understood, and agree "
        "to all terms and conditions set forth in this agreement."
    )
    pdf.ln(3)

    pdf.signature_block("Developer 1", ["Signature", "Name", "Date"])
    pdf.ln(2)
    pdf.signature_block("Developer 2", ["Signature", "Name", "Date"])
    pdf.ln(3)
    pdf.signature_block("Client (Vikas Marketing)", ["Signature", "Name", "Designation", "Date"])

    pdf.ln(5)
    pdf.set_draw_color(180, 180, 180)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(2)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(120, 120, 120)
    pdf.multi_cell(0, 5, "This document is generated for professional use. Both parties are advised to seek independent legal counsel before execution.", align="C")

    output_path = r"C:\Users\WELCOME\Desktop\Vikas Project\Vikas_Marketing_Agreement.pdf"
    pdf.output(output_path)
    print(f"PDF generated successfully: {output_path}")

if __name__ == "__main__":
    generate_agreement()
